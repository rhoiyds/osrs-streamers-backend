FROM python:3.8

ADD fonts /fonts
ADD runescape_name_detector /runescape_name_detector
COPY streamer-getter/label_map.pbtxt .
COPY streamer-getter/streamer-getter.py .
RUN apt-get -y update && apt-get -y install protobuf-compiler python-lxml python-pil automake ca-certificates g++ git libtool libleptonica-dev make pkg-config unzip git libgl1-mesa-dev
RUN pip install Cython pandas tf-slim python-twitch-client pytesseract opencv-python-headless tensorflow
RUN git clone https://github.com/tensorflow/models.git
WORKDIR /models/research
RUN protoc object_detection/protos/*.proto --python_out=. && export PYTHONPATH=/models
RUN cp object_detection/packages/tf2/setup.py .
RUN python -m pip install --use-feature=2020-resolver .
RUN mkdir /tesseract && mkdir /poor_detection
WORKDIR  /tesseract
RUN wget https://github.com/tesseract-ocr/tesseract/archive/4.1.1.zip && unzip 4.1.1.zip
WORKDIR /tesseract/tesseract-4.1.1
RUN ./autogen.sh && ./configure && make && make install && ldconfig
RUN wget https://github.com/tesseract-ocr/tessdata/raw/master/eng.traineddata -P /tesseract/tesseract-4.1.1/tessdata && export TESSDATA_PREFIX=/tesseract/tesseract-4.1.1/tessdata
WORKDIR /fonts
RUN cp -r . /tesseract/tesseract-4.1.1/tessdata
WORKDIR /