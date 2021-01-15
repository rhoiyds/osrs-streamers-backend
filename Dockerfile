FROM python:3.8

COPY . .
RUN apt-get -y update && apt-get -y install protobuf-compiler python-lxml python-pil automake ca-certificates g++ git libtool libleptonica-dev make pkg-config unzip git
RUN python -c "import sys; print(sys.version)" && python -c "import struct; print(struct.calcsize('P')*8)"
RUN pip install Cython pandas tf-slim python-twitch-client pytesseract opencv-python-headless tensorflow
RUN git clone https://github.com/tensorflow/models.git
WORKDIR /models/research
RUN protoc object_detection/protos/*.proto --python_out=. && export PYTHONPATH=/models
RUN python setup.py build && python setup.py install
RUN mkdir /tesseract && mkdir /poor_detection && mkdir /verified-streamers
WORKDIR  /tesseract
RUN wget https://github.com/tesseract-ocr/tesseract/archive/4.1.1.zip && unzip 4.1.1.zip
WORKDIR /tesseract/tesseract-4.1.1
RUN ./autogen.sh && ./configure && make && make install && ldconfig
RUN wget https://github.com/tesseract-ocr/tessdata/raw/master/eng.traineddata -P /tesseract/tesseract-4.1.1/tessdata && export TESSDATA_PREFIX=/tesseract/tesseract-4.1.1/tessdata
WORKDIR /fonts
RUN cp -r . /tesseract/tesseract-4.1.1/tessdata
WORKDIR /