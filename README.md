

# Optical Character Recognition (OCR) for Text Extraction and Verification

A robust solution that uses Optical Character Recognition (OCR) to seamlessly extract text from scanned documents, intelligently auto-fill digital forms, and verify the extracted data.
Unlike most solutions that depend on cloud services or large models, our system can run fully offline, even on low-end computers. This makes it especially useful for adoption in remote areas without reliable network connectivity, ensuring accessibility and ease of setup anywhere.

## Video Demo


##  Table of Contents

- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architectural Design](#architectural-design)
- [Challenges and Solutions](#challenges-and-solutions)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [1. OCR Extraction API](#1-ocr-extraction-api)
  - [2. Data Verification API](#2-data-verification-api)

## Problem Statement
The process of manually extracting and verifiying information from physical documents like - application forms , ID cards , and certificates is inefficient and error prone.

The traditional process in not only slow but also introduces high risk of data entry mistakes and inconsistencies. These inaccuracies can lead to compromised data integrity and siginificant delays in critical processes. Our solution aims to replace this manual effort with automation that is fast , reliable and easy-to-use.

## Key Features
 1. **Automated Data Extraction**: 
 - Simply upload your document as a PDF or image to receive accurately extracted text in seconds, all while minimizing the errors commonly found in manual data entry.
 -  **Auto-Fill Digital Form** smartly using the extracted data for more accuratly and easily
 - **Multi-Lingual Support**  - Our project is equipped to handle complex international character sets. It offers robust supoort for not only Latin-Based languages but also suports Non-Latin languages such as Chinese, Japanese, and Korean.
 2. **Data Verification**: 
 - This feature acts as a crucial safety net to ensure the absolute accuracy of your data.

- It cross verifies the data entered in the digital form with the data from the  original scanned document field by field . Any mismatches will be flagged , and each field will be assigned a **confidence score** providing reliable measure for data accuracy.
3. **Image Quality analysis**: 
- **Automatic Scan Analysis**: The system first checks every document for common quality issues.
- **Detects Key Problems**: Every uploaded image is scored 0–100 before OCR to ensure accurate text extraction.
  The pipeline combines several computer-vision tests implemented with OpenCV, NumPy, and SciPy:

    - **Resolution** : Flags image smaller than 500px
    -  **Blur** : combines several detectors (edges, gradients, frequency content, text-region sharpness) into one overall blur score.
    - **Contrast** : measures global and local contrast to spot poor lighting.
    - **Text Clarity** : verifies clear character boundaries and line separation.
    - **Skew** : detects the page tilt and flags the error.
  Starting from 100, points are deducted for each issue and clear suggestions are returned.



4. **Multi-Page Document support**:
- **Handles Long Documents**: The system is built to process files containing multiple pages without issue.
- **Ensures Data Integrity**: It captures information from all pages and maintains the correct sequence, which is crucial for long forms.
5. **Real-time Confidence zones**: 
- **Instant Visual Feedback**: Provides immediate feedback by drawing bounding boxes directly on the original document image.
- **Shows OCR Confidence**: Each box is color-coded or labeled to show the confidence level of the text recognition inside it.
6 . **Fully-Offline & Remote Friendly**:
- **Works without internet connectivity**, ensuring adoption in remote or low-connectivity regions.
- Protects data privacy by keeping all processing on local machines.
- Optimized to run even on low-end hardware , reducing infrastructure costs.
7. **Simple and Portable Setup**:
- The entire and system can be deployed with simple commands using Docker
- No cloud dependency , No External Configuration.
- Suitable for on-premise deployment in schools, offices, and government agencies in rural areas.

## Tech Stack
 - ### Backend :
    - OCR Model - PHOCR(PaddleOCR)
    - LLM for Intelligent Mapping - Qwen2.5-1.5B-Instruct
    - Server Logic - Python , FAST API
    - Ollama for offline functionality of LLM.
 - ### Frontend:
   - HTML /CSS
   - React.js


## Architectural Design

## Challenges and Solutions
 1. **Handling Tilted or Skewed Images**:
- **The Challenge**: The OCR model's accuracy dropped significantly when a document was tilted by more than 10° degrees, often failing to extract text correctly.

- **The Solution**: We integrated a deskewing algorithm into the image preprocessing pipeline. This automatically detects and corrects the rotational angle of any input document, ensuring the text is properly aligned before the OCR engine processes it. This step made our extraction far more reliable on real-world scans.
  
-  **The Result**: As a result, the system now maintains strong accuracy for images with skew angles of up to ±30°.
  


2. **Selecting the Optimal OCR Model**:
 -**The Challenge**: Our initial choice, TrOCR, performed well with Latin scripts but struggled with accuracy on our specific test data, especially with non-Latin languages.

-**The Solution**:We created a benchmark set of 50 images of varying quality (different resolutions, lighting conditions, and languages) and measured the accuracy of both TrOCR and PHOCR.
The results are shown in the graph below.
<img width="1641" height="983" alt="PhOCR vs TrOCR" src="https://github.com/user-attachments/assets/fba90ffa-7cab-4da0-a413-b2d510db2dcd" />



- **Test Results** : Both performed equally well for high quality images , but when it came to low quality and languages other than english PHOCR performed better than TrOCR.

 After comparative testing, we switched to the PHOCR model. It demonstrated superior overall accuracy and, crucially, performed exceptionally well with complex character sets like Chinese and Japanese, where TrOCR had failed. This decision was key to achieving the project's multi-lingual requirements.

3. **Ensuring Offline Functionality & Low-End Hardware Support**:
- **The Challange**: Many OCR + AI solutions rely on cloud APIs or require powerful GPUs, making them unusable in remote areas without reliable internet and on low-cost hardware. This risked excluding the very users who need automation most.
- **The Solution**: We re-architected the pipeline to run entirely offline, packaging OCR (PHOCR), LLM-based mapping (Qwen2.5-1.5B-Instruct), and FastAPI into a self-contained system. With lightweight optimization and Docker Compose setup, the solution can be launched in just two commands, even on machines with lower Hardware configurations.
- **The Result** : The system is now deployable in remote regions, supporting low-resource environments and enabling adoption by local governments and organizations. This aligns with MOSIP’s mission to provide inclusive, secure, and accessible digital identity solutions globally.

## Getting Started 
 ### Backend Setup:
 **Option A** (Without Docker): For developers  who want to look at the code directly and make the changes to code.
 - ### Prerequisites:
 > **Note:** The project **must** be run on **Windows** or **Linux** systems. Other operating systems are not supported.

Make sure the following are installed before running the project:

- **Python 3.10+**  
  Required for the FastAPI backend.

- **pip**  
  Comes with most Python installations. Used to install Python dependencies.


- **Node.js (v18+) & npm**  
  Needed to build and run the React frontend.

- **Git**  
  To clone the repository.
 - **Docker**(Optional for deploying the backend): For running the application in container.

 - ### Installation:
  1. Clone the Repository:

 ```bash

git clone https://github.com/KrishnaChaitanya16/MosipDecode2025.git
```
2.  Move to the backend folder :
``` bash
cd backend
```
3. Create and Activate  Virtual Python Environment;
```bash
python3 -m venv .venv
```
- Activation for Windows run the following command:
		- ``` 
		 .venv\Scripts\Activate
		 ```
- Activation in Linux :
		- ``` .venv\Scripts\Activate```
4. Install requirements for backend:
``` bash
pip install -r requirements.txt
```
Now before running the main OCR backend server , setup the LLM server:

5. From backend move to app directory
``` bash 
cd app
```
6. Now start the LLM server:
> Note : before starting the LLM server , make sure Ollama CLI is installed and up and running. Steps given below:
> Our backend uses **Ollama** to run the Qwen2.5-1.5B-Instruct model fully offline.
  - Ollama setup :
    Download and install [Ollama](https://ollama.com/download) from the official site
    1. After installation verify Ollama is working by using the command in main terminal:
    ``` bash 
    ollama --version
    ```
     2.  Pull the Qwen2.5 Model:
      ``` bash
      ollama pull qwen2.5:1.5b
      ```
      3. verify the download :
      ``` bash 
      ollama list
      ```
      You should see `qwen2.5:1.5b` in the list.
 - Run the LLM server code:
    In the ``` backend/app``` folder:
    ``` bash
    python3 mappingfinal.py
    ```
    You  must see something like this :
   <img width="914" height="218" alt="image" src="https://github.com/user-attachments/assets/025e2ea9-496a-4da1-8895-1feed69e777a" />


7. Setting up the main backend server:
  Make sure ``` mappingfinal.py``` is running . Open a new terminal and navigate to ``` backend/``` folder :
  ``` bash
  uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
  ```
  Now you should see Some thing like this :


After this backend  is Ready.

**Option B** : For quick Setup or deploying the service and use it in real-word applications.
Ensure Docker is  installed and running in the background, also ensure Internet connectivity for building the image , first run of the image.



**Without building the image locally**:
	
	docker pull venkat96r/ocr_backend:latest
	
	
After the pull is you should see something like this:

- Run the image :
	
	``` 
	docker run -d -p 8000:8000 venkat96r/ocr_backend:latest
	```
After the successful run you should see something like this:

**If you want to build the image locally**:

Run the follwoing command:

``` bash
docker build -t ocr_backend:latest
```
To run the image:

``` bash
docker run -d -p 8000:8000 venkat96r/ocr_backend:latest
```


### Frontend Setup:
After Successfully setting up the backend  either with Docker or without it . To setup the frontend follow the below steps:
1. Move to the frontend folder:
 ``` bash 
  cd frontend
  ```
  2. Install the dependencies:
  ``` bash
  npm install
  ```
  3. Run the frontend:
  ``` bash
  npm start
  ```














	
	
			
	
	

       


		
	




## API Documentation

 1. **OCR Extraction API**

This API extracts text from a document image and maps the extracted text to given fields.

* **Endpoint**: `/extract` 
* **Method**: `POST` 
* **Headers**: `Content-Type: multipart/form-data`
* **Body** (form-data):
    * **document** (file): The image file of the document to be processed (e.g., `dummy_aadhaar.png`).
    * **include\_detection** (text): A boolean value ("true" or "false") to indicate whether to include detailed detection information in the response.
    * **fields** (text): A JSON array of strings representing the fields to be extracted from the document (e.g., `["name", "date of birth", "gender", "aadhaar number"]`).

### Successful Response (200 OK)

* **Content-Type**: `application/json` 
* **Body (JSON)**:
    * **mapped\_fields** (object): An object containing the extracted fields as key-value pairs.
        * **Example**: 
            ```json
            {
              "name": "Vaishnavi Singh",
              "date of birth": "16/11/2004",
              "gender": "FEMALE",
              "aadhaar number": "8911 3824 2345"
            }
            ```
           
    * **detections** (array): An array of objects, where each object represents a detected text block in the document. Each object contains:
        * `text` (string): The detected text.
        * `confidence` (number): The confidence score of the detection.
        * `bbox` (object): The bounding box of the detected text with coordinates `x1`, `y1`, `x2`, and `y2`.
        * `polygon` (array): The polygon coordinates of the detected text.
        * `confidence_level` (string): The confidence level of the detection (e.g., "low", "high").
    * **total\_detections** (number): The total number of text blocks detected.
    * **confidence\_overlay** (string): A base64 encoded image string of the document with confidence levels overlaid.
    * **has\_detection\_data** (boolean): A boolean indicating if detection data is available.
    * **processing\_info** (object): An object containing information about the processing of the document.
        * `language` (string): The language detected in the document.
        * `elapsed_time` (number): The time taken to process the document in seconds.
        * `page_number` (number): The page number of the document processed.
        * `is_pdf` (boolean): A boolean indicating if the document is a PDF.
        * `custom_fields_used` (number): The number of custom fields used for extraction.



 2. **Data Verification API**

This API verifies submitted data against the data extracted from a document image.

* **Endpoint**: `/verify` 
* **Method**: `POST` 
* **Headers**: `Content-Type: multipart/form-data`
* **Body** (form-data):
    * **document** (file): The image file of the document for verification.
    * **verification\_data** (text): A JSON object containing the key-value pairs to be verified against the document.
        * **Example**: 
            ```json
            {"Name": "John Smith", "age": "30", "gender": "Male", "address":"i23 elmst"}
            ```
          
    * **fields** (text): A JSON array of strings representing the fields to be verified.
        * **Example**: `["Name","age","gender","address"]` 

### Successful Response (200 OK)

* **success** (boolean): Indicates if the API call was successful.
* **verification\_result** (object): Contains the detailed results of the verification.
    * **overall\_status** (string): The overall verification status (e.g., "verified").
    * **overall\_confidence** (number): The overall confidence score of the verification (e.g., 100).
    * **field\_results** (object): An object detailing the verification for each submitted field, including the submitted value, extracted value, similarity score, status, and confidence.
    * **debug\_info** (object): Provides debugging information like the fields submitted and extracted.

 
   
