#!/bin/bash

# Force cache refresh by adding a timestamp to the HTML file
echo "Forcing cache refresh..."

# Add a timestamp comment to the HTML file
sed -i 's/<head>/<head>\n    <!-- Cache bust: $(date +%s) -->/' /var/www/ministry-app/dist/index.html

# Also add cache-busting meta tags
sed -i 's/<head>/<head>\n    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">\n    <meta http-equiv="Pragma" content="no-cache">\n    <meta http-equiv="Expires" content="0">/' /var/www/ministry-app/dist/index.html

echo "Cache refresh applied. Please hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)" 