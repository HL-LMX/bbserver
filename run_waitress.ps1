# PowerShell script to run Django via Waitress
$env:DJANGO_SETTINGS_MODULE = "bookingbite.settings"
$env:SERVERNAMES = "localhost,127.0.0.1,194.9.161.245"
cd "C:\deployments\bbserver"
.\venv\Scripts\python.exe -m waitress --listen=127.0.0.1:8000 bookingbite.wsgi:application
