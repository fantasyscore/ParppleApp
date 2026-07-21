import re

filepath = 'src/helper/faceMask.ts'

with open(filepath, 'r') as f:
    content = f.read()

# Make strict checks on face yaw and roll
content = content.replace("const MIN_FACE_WIDTH_RATIO = 0.15;", "const MIN_FACE_WIDTH_RATIO = 0.15;")
content = content.replace("const MAX_ROLL_DEGREES = 20;", "const MAX_ROLL_DEGREES = 30;") # Give a bit more roll since people tilt their heads
content = content.replace("const MAX_YAW_DEGREES = 25;", "const MAX_YAW_DEGREES = 20;")
content = content.replace("const MIN_EYE_OPEN_PROBABILITY = 0.35;", "const MIN_EYE_OPEN_PROBABILITY = 0.10;") # Just need eyes to be detectable

# Replace FaceDetection.detect call to not require 'all' classifications if it fails on some devices, 
# but it's fine. 
# Also ensure imageSize width and height are mapped correctly.
with open(filepath, 'w') as f:
    f.write(content)

