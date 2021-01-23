import urllib.request, json
from urllib.request import urlopen
from twitch import TwitchClient
import pprint
import tensorflow as tf
from object_detection.utils import label_map_util
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
import warnings
import requests
from io import BytesIO
from pytesseract import image_to_string
import cv2
import time
from object_detection.utils import visualization_utils as viz_utils
import math
import random
from statistics import mean
import os
from pathlib import Path
import sys
import difflib

os.environ['TESSDATA_PREFIX']='/tesseract/tesseract-4.1.1/tessdata'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings('ignore')

URL_TEMPLATE = 'https://static-cdn.jtvnw.net/previews-ttv/live_user_%s-1920x1080.jpg'
PATH_TO_SAVED_MODEL="/runescape_name_detector/saved_model"
PATH_TO_POOR_DETECTION="/poor_detection"
VERIFIED_STREAMERS_URL = "https://raw.githubusercontent.com/rhoiyds/osrs-streamers/master/resources/streamers.json"
CLIENT_ID = 'ifhhbwyqdp5p9fmhn33wvlsufsemp8'
OAUTH_TOKEN = sys.argv[1]
DETECT_FN = tf.saved_model.load(PATH_TO_SAVED_MODEL)
category_index=label_map_util.create_category_index_from_labelmap("/label_map.pbtxt",use_display_name=True)

def name_spacing_hack(name):
  return name.replace(" ","")

def get_twitch_streamers():
  print("Fetching live Twitch streams...", end=' ')
  client = TwitchClient(client_id=CLIENT_ID, oauth_token=OAUTH_TOKEN)
  offset = 0
  amount_received = 1
  streams = list()
  while amount_received != 0:
    result = client.streams.get_live_streams(None, 'Old School RuneScape', None, None, 100, offset)
    amount_received = len(result)
    offset = offset + 100
    streams.extend(result)
    amount_received = len(result)
  print('{} currently online'.format(len(streams)))
  return streams

def get_osrs_streamers():
  print("Fetching verified streamers from GitHub...")
  verified_streamers = json.loads(urlopen(VERIFIED_STREAMERS_URL).read())
  print("Received {} verified streamers".format(len(verified_streamers)))
  return verified_streamers

def get_string_from_image(img):
  name_trained = image_to_string(img, config='-c tessedit_char_whitelist=\"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:-_ \" --psm 7 -l eng.runescapechat07')
  return name_trained

def load_image_into_numpy_array(path):
    response = requests.get(path)
    img = Image.open(BytesIO(response.content))
    return np.array(img)

def preprocess_image(img):
    img = np.asarray(img)
    img = cv2.resize(img, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    rgb_planes = cv2.split(img)
    result_planes = []
    for plane in rgb_planes:
        dilated_img = cv2.dilate(plane, np.ones((7,7), np.uint8))
        bg_img = cv2.medianBlur(dilated_img, 21)
        diff_img = 255 - cv2.absdiff(plane, bg_img)
        result_planes.append(diff_img)
    img = cv2.merge(result_planes)
    kernel = np.ones((1, 1), np.uint8)
    img = cv2.dilate(img, kernel, iterations=1)
    img = cv2.erode(img, kernel, iterations=1)
    img = cv2.GaussianBlur(img, (5, 5), 0)
    img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    return Image.fromarray(img)

def preprocess_white_text(img):
    img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    img = cv2.resize(img, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    ret,bin = cv2.threshold(gray,127,255,cv2.THRESH_BINARY)
    kernel = np.ones((1,1),np.uint8)
    closing = cv2.morphologyEx(bin, cv2.MORPH_CLOSE, kernel)
    inv = cv2.bitwise_not(closing)
    img = cv2.GaussianBlur(inv, (5, 5), 0)
    return img

def get_detections_for_np_image(image_np, ):
    input_tensor=tf.convert_to_tensor(image_np)
    input_tensor=input_tensor[tf.newaxis, ...]
    detections=DETECT_FN(input_tensor)
    num_detections=int(detections.pop('num_detections'))
    detections={key:value[0,:num_detections].numpy()
                   for key,value in detections.items()}
    detections['num_detections']=num_detections
    detections['detection_classes']=detections['detection_classes'].astype(np.int64)
    return detections

def get_cropped_detection(image_np, box):
    im_height, im_width, im_depth = image_np.shape
    ymin = box[0]
    xmin = box[1]
    ymax = box[2]
    xmax = box[3]
    (left, right, top, bottom) = (xmin * im_width, xmax * im_width,
                                  ymin * im_height, ymax * im_height)

    img = Image.fromarray(image_np)
    return img.crop((left, top, right, bottom))

def streamer_channel_name(verified_streamer):
    return verified_streamer['twitchName']

def display_image_inline(img):
    cv2.imshow(img)

def test_model_performance(streams):
  random.shuffle(streams)
  for stream in streams:
    image_path = URL_TEMPLATE % stream.channel.name
    image_np=load_image_into_numpy_array(image_path)
    detections = get_detections_for_np_image(image_np)
    highest_confidence_per_class = get_highest_confidence_detections(detections)
    image_np_with_detections=image_np.copy()
    viz_utils.visualize_boxes_and_labels_on_image_array(
    image_np_with_detections,
    detections['detection_boxes'],
    detections['detection_classes'],
    detections['detection_scores'],
    category_index,
    use_normalized_coordinates=True,
    max_boxes_to_draw=10,
    min_score_thresh=.1,
    agnostic_mode=False)
    display_image_inline(image_np_with_detections)
    for key, value in highest_confidence_per_class.items():
      img = get_cropped_detection(image_np, value['box'])
      preprocessed_image = None
      if key == "chatbox name normal":
        preprocessed_image = preprocess_image(img)
      if key == "chatbox name trans":
        preprocessed_image = preprocess_white_text(img)
      if key == "title bar name":
        preprocessed_image = preprocess_white_text(img)
      display_image_inline(np.array(preprocessed_image))
      print("Class '{}' resulted in string '{}' with confidence {}".format(key, get_string_from_image(preprocessed_image).strip(), value['confidence']))

def get_highest_confidence_detections(detections):
  highest_confidence_per_class = {}
  for key, value in category_index.items():
    category_positions = [i for i in range(len(detections['detection_classes'])) if detections['detection_classes'][i] == value['id']]
    if len(category_positions) == 0:
      continue
    maxIndex = category_positions[0]
    for index in category_positions:
      if detections['detection_scores'][index] > detections['detection_scores'][maxIndex]:
        maxIndex = index
    confidence = math.floor(detections['detection_scores'][maxIndex] * 100)
    if confidence > 15:
      highest_confidence_per_class[value['name']] = {
          "confidence": confidence,
          "box": detections['detection_boxes'][maxIndex]
      }
  return highest_confidence_per_class

def save_poor_detection_to_file(stream, image_np, detections):
  im = get_drawn_detections(image_np, detections)
  im.save("{}/{}-{}.png".format(PATH_TO_POOR_DETECTION, stream.created_at, stream.channel.display_name))

def closeEnoughMatch(seq1, seq2):
    return difflib.SequenceMatcher(a=seq1.lower(), b=seq2.lower()).ratio()

def get_drawn_detections(image_np, detections):
      image_np_with_detections=image_np.copy()
      viz_utils.visualize_boxes_and_labels_on_image_array(
      image_np_with_detections,
      detections['detection_boxes'],
      detections['detection_classes'],
      detections['detection_scores'],
      category_index,
      use_normalized_coordinates=True,
      max_boxes_to_draw=10,
      min_score_thresh=.1,
      agnostic_mode=False)
      im = Image.fromarray(image_np_with_detections)
      return im

def verify_streamers(streams):
  counter = 0
  for stream in streams:
      print("{}/{} streamer '{}' ".format(counter + 1, len(streams), stream.channel.display_name),  end = ' ')
      counter = counter + 1
      image_path = URL_TEMPLATE % stream.channel.name
      image_np = load_image_into_numpy_array(image_path)
      detections = get_detections_for_np_image(image_np)
      highest_confidence_per_class = get_highest_confidence_detections(detections)
      key_list = list(highest_confidence_per_class.keys())
      if len(key_list) == 0:
        print("poor detection, no classes - skipping")
        save_poor_detection_to_file(stream, image_np, detections)
        continue
      max_key = key_list[0]

      for key, value in highest_confidence_per_class.items():
        if value['confidence'] > highest_confidence_per_class[max_key]['confidence']:
          max_key = key

      highest_class = highest_confidence_per_class[max_key]
      confidence = highest_class['confidence']
      img = get_cropped_detection(image_np, highest_class['box'])
      preprocessed_image = None
      name = None

      if max_key == "chatbox name normal":
        preprocessed_image = preprocess_image(img)
        name = get_string_from_image(preprocessed_image).strip()
        if ":" in name:
          name = name.split(":")[0]
      if max_key == "chatbox name trans":
        preprocessed_image = preprocess_white_text(img)
        name = get_string_from_image(preprocessed_image).strip()
        if ":" in name:
          name = name.split(":")[0]
      if max_key == "title bar name":
        preprocessed_image = preprocess_white_text(img)
        name = get_string_from_image(preprocessed_image).strip()
        if "- " in name:
          name = name.split("- ")[1]

      streamer_obj = next((streamer for streamer in verified_streamers if stream.channel.display_name == streamer['twitchName']), None)
      if streamer_obj:
        matchFound = False
        for characterName in streamer_obj['characterNames']:
            closeEnough = closeEnoughMatch(characterName, name)
            if closeEnough > 0.84:
                matchFound = True
                print("'{}' and '{}' are close enough ({}%)".format(name, characterName, closeEnough))
                break

      if matchFound:
        continue

      if not name or not name.strip():
        name = 'Undetermined'

      print("No matches found - queueing for processing")

      try:
        path = "/streamers/{}/{}".format(stream.channel.display_name, name)
        Path(path).mkdir(parents=True, exist_ok=True)
        thumbnail = Image.fromarray(image_np)
        thumbnail.save("/streamers/{}/{}/thumbnail.png".format(stream.channel.display_name, name))
        preprocessed_image_to_save = Image.fromarray(np.array(preprocessed_image))
        preprocessed_image_to_save.save("/streamers/{}/{}/preprocessed_image.png".format(stream.channel.display_name, name))
      except:
        print("Error saving file {} - skipping".format(path))
        pass

streams = get_twitch_streamers()
verified_streamers = get_osrs_streamers()
input_needed = verify_streamers(streams)
