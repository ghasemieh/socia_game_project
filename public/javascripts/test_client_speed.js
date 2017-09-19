function MeasureConnectionSpeed(callback) {

    var startTime, endTime, imageAddr, downloadSize, download, cacheBuster;

    imageAddr = "http://185.51.200.26/images/speedtest.jpg";
    downloadSize = 116227;

    download = new Image();
    startTime = (new Date()).getTime();
    cacheBuster = "?rand=_" + Math.random();
    download.src = imageAddr + cacheBuster;

    download.onload = function () {
        endTime = (new Date()).getTime();
        var duration = (endTime - startTime) / 1000;
        var bitsLoaded = downloadSize * 8;
        var speedBps = (bitsLoaded / duration).toFixed(2);
        var speedKbps = (speedBps / 1024).toFixed(2);
        var speedMbps = (speedKbps / 1024).toFixed(2);

        var speeds = {
            Bps: speedBps,
            Kbps: speedKbps,
            Mbps: speedMbps
        };
        return callback(speeds);
    };
}