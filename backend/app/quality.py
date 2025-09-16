import cv2
import numpy as np

def check_image_quality(image_path):
    suggestions = []
    score = 100  # start with perfect score, subtract for issues

    # Read the image
    img = cv2.imread(image_path)
    if img is None:
        return {"score": 0, "suggestions": ["Invalid image file. Please upload a valid image."]}

    h, w = img.shape[:2]

    # --- 1. Resolution check ---
    if w < 500 or h < 500:
        score -= 30
        suggestions.append("Image resolution is too low. Please upload a higher resolution image.")

    # --- 2. Blurriness check ---
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    fm = cv2.Laplacian(gray, cv2.CV_64F).var()
    if fm < 100:   # Threshold can be tuned
        score -= 25
        suggestions.append("The image is blurry. Please capture a sharper photo.")

    # --- 3. Contrast check ---
    contrast = gray.std()
    if contrast < 40:  # low contrast
        score -= 20
        suggestions.append("Low contrast detected. Use better lighting or darker text.")

    # --- 4. Skew check (approximate) ---
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLines(edges, 1, np.pi/180, 200)
    if lines is not None:
        angles = []
        for rho, theta in lines[:,0]:
            angle = (theta * 180/np.pi) - 90
            angles.append(angle)
        mean_angle = np.mean(angles)
        if abs(mean_angle) > 15:  # skewed more than 5 degrees
            score -= 15
            

    # --- Final adjustments ---
    score = max(0, min(100, score))  # keep between 0–100

    if not suggestions:
        suggestions.append("Good quality image ✅")

    return {"score": score, "suggestions": suggestions}

