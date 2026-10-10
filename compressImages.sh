#!/bin/bash

# Directories that include images to compress
declare -a dirs=("src/images/icons")

# Loop over the directories
for dir in "${dirs[@]}"; do
  # Loop over the files in the directory
  for file in $dir/*; do
    # Get the file extension
    extension="${file##*.}"
    # Compress the file if it is a png
    if [ "$extension" = "png" ]; then
      cwebp -q 20 -m 6 -resize 216 0 $file -o ${dir}/$(basename $file '.png').webp
      cwebp -q 20 -m 6 -resize 512 0 $file -o ${dir}/$(basename $file '.png')-hires.webp
    fi
  done
done
