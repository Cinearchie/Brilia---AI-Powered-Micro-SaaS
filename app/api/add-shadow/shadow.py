import cv2
import numpy as np

FG_IMG_PATH = "fg.png"      # Foreground image (with alpha channel)
BG_IMG_PATH = "bg.jpeg"     # Background image

def load_image(path, color_conversion=None):
    """Load image from file."""
    image = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if image is None:
        raise FileNotFoundError(f"❌ Could not load image at: {path}")
    if color_conversion:
        image = cv2.cvtColor(image, color_conversion)
    return image

def extract_alpha_channel(image):
    """Separate RGB and alpha channels."""
    alpha = image[:, :, 3]
    rgb = image[:, :, :3]
    return alpha, rgb

def normalize_and_expand(alpha):
    """Normalize to [0,1] and expand to 3 channels."""
    norm = alpha / 255.0
    return np.repeat(norm[:, :, np.newaxis], 3, axis=2)

def blend_foreground(fg, alpha, bg):
    """Blend fg over bg using alpha."""
    return (alpha * fg + (1 - alpha) * bg).astype(np.uint8)

def generate_composited_output(fg_path, bg_path, output_path):
    # Load images
    fg_img = load_image(fg_path)
    bg_img = load_image(bg_path, cv2.COLOR_BGR2RGB)

    # Resize background to match fg
    bg_img = cv2.resize(bg_img, (fg_img.shape[1], fg_img.shape[0]))

    # Extract alpha and RGB
    alpha, fg_rgb = extract_alpha_channel(fg_img)
    fg_rgb = cv2.cvtColor(fg_rgb, cv2.COLOR_BGR2RGB)

    # Normalize alpha
    norm_alpha = normalize_and_expand(alpha)

    # Composite
    final = blend_foreground(fg_rgb, norm_alpha, bg_img)

    # Save
    cv2.imwrite(output_path, cv2.cvtColor(final, cv2.COLOR_RGB2BGR))
    print(f"✅ Saved composited output image to {output_path}")

# 🔧 Run it
generate_composited_output("fg.png", "bg.jpeg", "final_output121.png")
