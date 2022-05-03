
# this is a shell script for converting all pngs in a directory to webp
# (requires imagemagick)
for file in *.png;
  magick $file -define webp:lossless=true (basename $file .png).webp
end

# add function here for making animated webps (for whistlegraph spinners)
# (requires webp [installable via homebrew]) https://chromium.googlesource.com/webm/libwebp