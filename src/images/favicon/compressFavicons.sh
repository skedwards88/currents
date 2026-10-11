# Since the favicon is flat colors, can force an 8-bit palette and lossy compression.
# If wanted to avoid lossy compression, could do this instead:
# magick src/images/favicon/original_color.png -resize 192x192 -strip -define png:compression-level=9 -define png:compression-filter=5 -define png:compression-strategy=1 src/images/favicon/favicon_color_192.png
# If didn't want any compression, could just resize and strip the metadata:
# magick src/images/favicon/original_color.png -resize 192x192 -strip src/images/favicon/favicon_color_192.png

magick src/images/favicon/original_color.png -define icon:auto-resize=48,32,16 src/images/favicon/favicon.ico
magick src/images/favicon/original_color.png -resize 180x180 -strip -colors 256 -define png:compression-level=9 PNG8:src/images/favicon/favicon_color_180.png
magick src/images/favicon/original_color.png -resize 192x192 -strip -colors 256 -define png:compression-level=9 PNG8:src/images/favicon/favicon_color_192.png
magick src/images/favicon/original_color.png -resize 512x512 -strip -colors 256 -define png:compression-level=9 PNG8:src/images/favicon/favicon_color_512.png
magick src/images/favicon/original_bw.png -resize 192x192 -strip -colors 256 -define png:compression-level=9 PNG8:src/images/favicon/favicon_bw_192.png
magick src/images/favicon/original_bw.png -resize 512x512 -strip -colors 256 -define png:compression-level=9 PNG8:src/images/favicon/favicon_bw_512.png
