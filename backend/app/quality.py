import cv2
import numpy as np
from scipy import ndimage
import math


def check_image_quality(image_path):
    """
    Enhanced image quality check with robust blur detection
    Uses only cv2, numpy, and scipy
    """
    suggestions = []
    score = 100  # start with perfect score, subtract for issues

    # Read the image
    img = cv2.imread(image_path)
    if img is None:
        return {"score": 0, "suggestions": ["Invalid image file. Please upload a valid image."]}

    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # --- 1. Resolution check ---
    if w < 500 or h < 500:
        score -= 15
        suggestions.append("Image resolution is too low. Please upload a higher resolution image.")

    # --- 2. Multi-method Blur Detection ---
    blur_scores = {}
    
    # Method 1: Laplacian Variance (existing method)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    blur_scores['laplacian'] = laplacian_var
    
    # Method 2: Sobel Variance
    sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    sobel_var = np.var(sobel_x) + np.var(sobel_y)
    blur_scores['sobel'] = sobel_var
    
    # Method 3: Gradient Magnitude Analysis
    gradient_magnitude = np.sqrt(sobel_x**2 + sobel_y**2)
    gradient_mean = np.mean(gradient_magnitude)
    gradient_std = np.std(gradient_magnitude)
    blur_scores['gradient_mean'] = gradient_mean
    blur_scores['gradient_std'] = gradient_std
    
    # Method 4: High Frequency Content Analysis
    f_transform = np.fft.fft2(gray)
    f_shift = np.fft.fftshift(f_transform)
    magnitude_spectrum = np.log(np.abs(f_shift) + 1)
    
    # Focus on high frequency components
    rows, cols = gray.shape
    crow, ccol = rows // 2, cols // 2
    high_freq_mask = np.ones((rows, cols))
    r = min(rows, cols) // 6  # Radius for high frequency region
    y, x = np.ogrid[:rows, :cols]
    mask_area = (x - ccol) ** 2 + (y - crow) ** 2 <= r*r
    high_freq_mask[mask_area] = 0
    
    high_freq_content = np.mean(magnitude_spectrum * high_freq_mask)
    blur_scores['high_freq'] = high_freq_content
    
    # Method 5: Text-specific blur detection
    text_blur_score = detect_text_blur(gray)
    blur_scores['text_blur'] = text_blur_score
    
    # Method 6: Edge Sharpness Analysis
    edge_sharpness = analyze_edge_sharpness(gray)
    blur_scores['edge_sharpness'] = edge_sharpness
    
    # Method 7: Variance of Laplacian in multiple scales
    multiscale_blur = detect_multiscale_blur(gray)
    blur_scores['multiscale'] = multiscale_blur
    
    # Combine blur metrics for final assessment
    overall_blur_score = combine_blur_metrics(blur_scores, gray.shape)
    
    # Apply blur penalties based on combined score
    if overall_blur_score < 0.15:  # Severely blurred
        score -= 55
        suggestions.append("The image is severely blurred and text is not readable. Please capture a much sharper photo.")
    elif overall_blur_score < 0.3:  # Very blurred
        score -= 40
        suggestions.append("The image is very blurry. Please capture a sharper photo with better focus.")
    elif overall_blur_score < 0.5:  # Moderately blurred
        score -= 30
        suggestions.append("The image is moderately blurry. Please improve focus for better OCR results.")
    elif overall_blur_score < 0.7:  # Slightly blurred
        score -= 20
        suggestions.append("The image has slight blur. Consider improving focus for optimal results.")

    # --- 3. Enhanced Contrast check ---
    contrast = gray.std()
    # Also check local contrast variation
    local_contrast = analyze_local_contrast(gray)
    
    if contrast < 40 or local_contrast < 20:
        score -= 15
        suggestions.append("Low contrast detected. Use better lighting or ensure clear text visibility.")

    # --- 4. Text clarity check ---
    text_clarity_score = assess_text_clarity(gray)
    if text_clarity_score < 0.5:
        score -= 25
        suggestions.append("Text clarity is poor. Ensure the document is properly focused and well-lit.")

    # --- 5. Skew check (improved) ---
    skew_angle = detect_skew_angle(gray)
    if abs(skew_angle) > 10:
        score -= 15
        suggestions.append(f"Document is skewed by {abs(skew_angle):.1f}°. Please align the document properly.")

    # --- Final adjustments ---
    score = max(0, min(100, score))

    if not suggestions:
        suggestions.append("Good quality image ✅")

    return {
        "score": score,
        "suggestions": suggestions,
        "blur_details": {
            "overall_blur_score": overall_blur_score,
            "individual_scores": blur_scores,
            "text_clarity": text_clarity_score
        }
    }


def detect_text_blur(gray_image):
    """
    Detect blur specifically in text regions
    """
    # Use adaptive threshold to find text regions
    adaptive_thresh = cv2.adaptiveThreshold(
        gray_image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    
    # Find contours that might be text
    contours, _ = cv2.findContours(adaptive_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    text_blur_scores = []
    
    for contour in contours:
        area = cv2.contourArea(contour)
        if 50 < area < 5000:  # Filter for text-like regions
            x, y, w, h = cv2.boundingRect(contour)
            
            # Extract text region
            text_region = gray_image[y:y+h, x:x+w]
            
            if text_region.size > 0:
                # Calculate sharpness in text region using multiple methods
                laplacian_var = cv2.Laplacian(text_region, cv2.CV_64F).var()
                
                # Also use Sobel for comparison
                sobel_x = cv2.Sobel(text_region, cv2.CV_64F, 1, 0, ksize=3)
                sobel_y = cv2.Sobel(text_region, cv2.CV_64F, 0, 1, ksize=3)
                sobel_var = np.var(sobel_x) + np.var(sobel_y)
                
                # Combine both measures
                combined_score = (laplacian_var + sobel_var * 0.5) / 1.5
                text_blur_scores.append(combined_score)
    
    if text_blur_scores:
        avg_text_blur = np.mean(text_blur_scores)
        # Normalize to 0-1 scale (adjusted thresholds for text regions)
        return min(avg_text_blur / 300, 1.0)
    else:
        return 0.0


def detect_multiscale_blur(gray_image):
    """
    Detect blur at multiple scales using Gaussian blur and variance comparison
    """
    original_var = cv2.Laplacian(gray_image, cv2.CV_64F).var()
    
    scales = [1, 2, 3]  # Different blur scales
    blur_ratios = []
    
    for scale in scales:
        # Apply Gaussian blur
        blurred = cv2.GaussianBlur(gray_image, (scale*2+1, scale*2+1), scale)
        blurred_var = cv2.Laplacian(blurred, cv2.CV_64F).var()
        
        # Calculate ratio (should be high for sharp images)
        if blurred_var > 0:
            ratio = original_var / blurred_var
            blur_ratios.append(ratio)
    
    if blur_ratios:
        # Mean ratio - higher means sharper
        mean_ratio = np.mean(blur_ratios)
        # Normalize to 0-1 scale
        return min(mean_ratio / 5.0, 1.0)
    else:
        return 0.0


def analyze_edge_sharpness(gray_image):
    """
    Analyze the sharpness of edges in the image
    """
    # Detect edges using multiple methods
    canny_edges = cv2.Canny(gray_image, 50, 150)
    
    if np.sum(canny_edges) == 0:
        return 0.0
    
    # Calculate gradient along edge pixels
    sobel_x = cv2.Sobel(gray_image, cv2.CV_64F, 1, 0, ksize=3)
    sobel_y = cv2.Sobel(gray_image, cv2.CV_64F, 0, 1, ksize=3)
    gradient_magnitude = np.sqrt(sobel_x**2 + sobel_y**2)
    
    # Get gradient values at edge pixels
    edge_gradients = gradient_magnitude[canny_edges > 0]
    
    if len(edge_gradients) == 0:
        return 0.0
    
    # Calculate statistics
    mean_edge_gradient = np.mean(edge_gradients)
    max_edge_gradient = np.max(edge_gradients)
    
    # Combine mean and max for better assessment
    combined_score = (mean_edge_gradient * 0.7) + (max_edge_gradient * 0.3)
    
    # Normalize to 0-1 scale
    return min(combined_score / 80, 1.0)


def analyze_local_contrast(gray_image):
    """
    Analyze local contrast variations
    """
    # Calculate local standard deviation using a sliding window
    kernel_size = 9
    kernel = np.ones((kernel_size, kernel_size), np.float32) / (kernel_size * kernel_size)
    
    # Convert to float for calculations
    float_img = gray_image.astype(np.float32)
    
    # Calculate local mean
    local_mean = cv2.filter2D(float_img, -1, kernel)
    
    # Calculate local variance
    local_mean_sq = cv2.filter2D(float_img**2, -1, kernel)
    local_variance = local_mean_sq - local_mean**2
    local_std = np.sqrt(np.maximum(local_variance, 0))
    
    return np.mean(local_std)


def assess_text_clarity(gray_image):
    """
    Assess overall text clarity using multiple metrics
    """
    # Method 1: Check for clear character boundaries
    adaptive_thresh = cv2.adaptiveThreshold(
        gray_image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    
    # Method 2: Analyze stroke consistency using morphological operations
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    opening = cv2.morphologyEx(adaptive_thresh, cv2.MORPH_OPEN, kernel)
    
    # Method 3: Calculate the ratio of clean text pixels
    clean_ratio = np.sum(opening == 255) / np.sum(adaptive_thresh == 255) if np.sum(adaptive_thresh == 255) > 0 else 0
    
    # Method 4: Edge density in text regions
    edges = cv2.Canny(gray_image, 30, 100)
    edge_density = np.sum(edges > 0) / edges.size
    
    # Method 5: Character separation analysis
    # Horizontal projection to detect text lines
    horizontal_projection = np.sum(adaptive_thresh == 0, axis=1)
    text_lines = len([1 for i in range(1, len(horizontal_projection)) 
                     if horizontal_projection[i] > 0 and horizontal_projection[i-1] == 0])
    
    # Normalize text line count
    normalized_lines = min(text_lines / (gray_image.shape[0] / 50), 1.0)
    
    # Combine metrics
    clarity_score = (clean_ratio * 0.3) + (min(edge_density * 8, 1.0) * 0.4) + (normalized_lines * 0.3)
    
    return clarity_score


def detect_skew_angle(gray_image):
    """
    Improved skew angle detection using HoughLinesP
    """
    edges = cv2.Canny(gray_image, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=80, minLineLength=50, maxLineGap=10)
    
    if lines is None:
        return 0.0
    
    angles = []
    for line in lines:
        x1, y1, x2, y2 = line[0]
        length = np.sqrt((x2-x1)**2 + (y2-y1)**2)
        if length > 30:  # Only consider longer lines
            angle = math.degrees(math.atan2(y2 - y1, x2 - x1))
            # Normalize angle to [-90, 90] range
            if angle > 90:
                angle -= 180
            elif angle < -90:
                angle += 180
            angles.append(angle)
    
    if not angles:
        return 0.0
    
    # Find the most common angle using histogram
    angles = np.array(angles)
    # Remove outliers (angles too far from horizontal)
    angles = angles[np.abs(angles) < 45]
    
    if len(angles) == 0:
        return 0.0
    
    # Calculate weighted mean (prefer angles closer to 0)
    weights = 1.0 / (1.0 + np.abs(angles))
    weighted_mean = np.average(angles, weights=weights)
    
    return weighted_mean


def combine_blur_metrics(blur_scores, image_shape):
    """
    Combine multiple blur detection methods for robust assessment
    """
    h, w = image_shape
    
    # Normalize individual scores with adjusted thresholds
    normalized_scores = {}
    
    # Laplacian variance (higher = sharper)
    normalized_scores['laplacian'] = min(blur_scores['laplacian'] / 400, 1.0)
    
    # Sobel variance (higher = sharper)
    normalized_scores['sobel'] = min(blur_scores['sobel'] / 800, 1.0)
    
    # Gradient mean (higher = sharper)
    normalized_scores['gradient_mean'] = min(blur_scores['gradient_mean'] / 40, 1.0)
    
    # Gradient std (higher = sharper)
    normalized_scores['gradient_std'] = min(blur_scores['gradient_std'] / 25, 1.0)
    
    # High frequency content (higher = sharper)
    normalized_scores['high_freq'] = min(blur_scores['high_freq'] / 8, 1.0)
    
    # Text blur score (already normalized)
    normalized_scores['text_blur'] = blur_scores['text_blur']
    
    # Edge sharpness (already normalized)
    normalized_scores['edge_sharpness'] = blur_scores['edge_sharpness']
    
    # Multiscale blur (already normalized)
    normalized_scores['multiscale'] = blur_scores['multiscale']
    
    # Weighted combination (emphasize text-specific and edge-based metrics)
    weights = {
        'laplacian': 0.12,
        'sobel': 0.12,
        'gradient_mean': 0.10,
        'gradient_std': 0.10,
        'high_freq': 0.08,
        'text_blur': 0.25,      # Highest weight for text-specific detection
        'edge_sharpness': 0.15,  # High weight for edge sharpness
        'multiscale': 0.08
    }
    
    overall_score = sum(normalized_scores[metric] * weights[metric] 
                       for metric in normalized_scores.keys())
    
    return overall_score

