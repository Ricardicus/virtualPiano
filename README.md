# Virtual piano

One can play with keys on the keyboard or click with the mouse.

<img src="https://raw.githubusercontent.com/Ricardicus/virtualPiano/master/demo/piano.png"></img>

# Docker container

This docker container exposes port 8080.
So to launch it as a service:

```
docker build --tag virtualpiano:1.0 .
docker run -d -p 8090:8080 virtualpiano:1.0
```

Now navigate to localhost:8090 in your browser!

# Visit website

The service is running on my Raspberry Pi at the moment, reachable here:
http://piano.ricardicus.se
