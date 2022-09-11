# this is a shell script for converting all images in a directory to webp
# currently supports all files with an "image*" mimetype 

# you can pass `-ll` for lossless compression
# (requires imagemagick)

if test "$argv[1]" = -ll
    # use lossless encoding if -ll is passed 
    for file in * 
      if test (string match "image/*" (file -b --mime-type $file))
        echo "Converting $file to webp with LOSSLESS compression..."
        convert $file -define webp:lossless=true (path change-extension '' $file).webp
      end
    end
else
    # otherwise use imagemagick default
    for file in * 
      if test (string match "image/*" (file -b --mime-type $file))
        echo "Converting $file to webp with DEFAULT compression..."
        convert $file (path change-extension '' $file).webp
      end
    end
end

# see also: https://imagemagick.org/script/webp.php,
#           https://stackoverflow.com/a/29177261