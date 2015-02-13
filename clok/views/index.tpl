<!DOCTYPE html>
<html lang="en">
<head>
    <title>Clok</title>
</head>

<body>
    <h1>Clok − /</h1>
    <p>
        Playing : {{ url or "nothing !" }}
        % if playing:
            <a href="/stop/">stop</a>
        % elif url:
            <a href="/play/">play</a>
        % end
    </p>
    <form method="post" action="play/">
        <input type="text" name="url" placeholder="http://live.francra.org:8000/radiocanut">
        <input type="submit" value="Play">
    </form>
</body>
</html>
