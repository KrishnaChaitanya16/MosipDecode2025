
# Optical Character Recognition (OCR) for Text Extraction and Verification

A robust solution that uses Optical Character Recognition(OCR) to seamlessly extract text from scanned documents , and intelligently auto-fill digital forms , and verify the extracted data. It is built for people who are looking to eliminate manual data entry , reduce erros and  improve data processing efficiancy

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

The traditional process in not only slow but also introduces high risk of data entry mistakes and inconsistencies. These inaccuracies can lead to compromised data integrity and siginificant delays in critical processes. Our solution aims to repplace this manual effort with automated that is fast , reliable and easy-to-use.

## Key Features
 1. **Automated Data Extraction**: 
 - Simply upload your document as a PDF or image to receive accurately extracted text in seconds, all while minimizing the errors commonly found in manual data entry.
 -  **Auto-Fill Digital Form**  using the extracted data for more accuratly and easily
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
## Tech Stack
 - ### Backend :
    - OCR Model - PHOCR(PaddleOCR)
    - Server Logic - Python , FAST API
 - ### Frontend:
   - HTML /CSS
   - React.js


## Architectural Design

## Challenges and Solutions
 1. **Handling Tilted or Skewed Images**:
- **The Challenge**: The OCR model's accuracy dropped significantly when a document was tilted by more than five degrees, often failing to extract text correctly.

- **The Solution**: We integrated a deskewing algorithm into the image preprocessing pipeline. This automatically detects and corrects the rotational angle of any input document, ensuring the text is properly aligned before the OCR engine processes it. This step made our extraction far more reliable on real-world scans.


2. **Selecting the Optimal OCR Model**:
 -**The Challenge**: Our initial choice, TrOCR, performed well with Latin scripts but struggled with accuracy on our specific test data, especially with non-Latin languages.

-**The Solution**:We created a benchmark set of 50 images of varying quality (different resolutions, lighting conditions, and languages) and measured the accuracy of both TrOCR and PHOCR.
The results are shown in the graph below.
<img width="1641" height="983" alt="PhOCR vs TrOCR" src="https://github.com/user-attachments/assets/fba90ffa-7cab-4da0-a413-b2d510db2dcd" />



- **Test Results** : Both performed equally well for high quality images , but when it came to low quality and languages other than english PHOCR performed better than TrOCR.

 After comparative testing, we switched to the PHOCR model. It demonstrated superior overall accuracy and, crucially, performed exceptionally well with complex character sets like Chinese and Japanese, where TrOCR had failed. This decision was key to achieving the project's multi-lingual requirements.

## Getting Started 
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

 - ### Installation:
  1. Clone the Repository:

 ```bash

git clone https://github.com/KrishnaChaitanya16/MosipDecode2025.git
```
> **Important Pre-Setup** : 
   Before starting the backend server , you must run the ```mappingfinal.ipynb``` notebook in Google Colab:

  - Open the notebook file ```backend/mappingfinal.ipynb``` in Google Colab.
  - Click **Runtime -> Run all** to execute every cell.
  - Wait untill all cells finish and Ngrok sever starts running.
  - Copy the Ngrok server public url as shown in the below image
    <img width="1239" height="166" alt="Screenshot 2025-09-26 at 9 56 11 AM" src="https://github.com/user-attachments/assets/073c2f43-472c-4af6-b972-7c7734211b48" />


  - Now replace the ```NGROK_API_URL``` in the ```backend/extraction.py``` with copied public URL as show in below
    <img width="1081" height="239" alt="Ngrok" src="https://github.com/user-attachments/assets/019d88ec-611f-4cdd-a31b-2c4f9108d9ef" />

  - Once the colab server starts running , proceed to backend server setup.

  
2. Move to the backend folder:
  ```bash
  cd backend
  ```  
3. Install all the requirements:
````bash
pip install -r requirements.txt

````
4. Similarly, to install the frontend, first move to the parent folder and then move to the frontend folder.
````bash
cd ..
cd frontend
````

5. Install the frontend dependencies.
````bash
npm install
````

6. Run the React application.
````bash
npm start
````

 - ### Running the application:
 1. To run the frontend, run the following command:
 ````bash
 npm start
 ````
 2. To run the backend, use the following commands:
 ````bash
 cd ..
 cd backend
 uvicorn app.main:app --reload
 ````


## API Documentation
- **1.OCR Extraction API**:
- **2.Data Verification API**:

 
   
