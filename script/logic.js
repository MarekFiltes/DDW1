var numberOfBackgroundProccesses = -1;

//add new URL aresses, old results will be removed
function webClick() {
    hideObj("links");
    hideObj("urlAdresses");
    $("#links").empty();
    showObj("urlList");
    showObj("addTitle");
    blocksAdapte();
}

//read data[title, keyword, body text] for from URL 
function sitesClick() {
    hideObj("viewport");
    infoTextClear();
    $("#links").empty();
    var arrayURL = new Array();
    var urlList = document.getElementById("urlList").value;
    var temp;
    var wrongCount=0;
    arrayURL = urlList.split("\n");
    hideObj("urlList");
    hideObj("addTitle");
    showObj("links");
    showObj("urlAdresses");

    //create element for numbered list with valid URLs, these will be proccesss
    $("#links").append("<ol id='numberedList' start='1'></ol>");

    //create list with no valid URLs, these no will be proccess
    $("#links").append("<div id='wrongURLs'><h1>wrong urls</h1><div>");
    var tempArray = arrayURL;
    arrayURL = new Array();

    //remove no valid URLs and create new array with only valid URLs
    for (var j = 0; j < tempArray.length; j++) {
        if (testExist(arrayURL, tempArray[j])) {
            continue;
        } else {
            if (validateURL(tempArray[j])) {
                arrayURL[arrayURL.length] = tempArray[j];
            } else {
                $("#wrongURLs").append("<label>" + tempArray[j] + "</label><br/>");
                wrongCount++;
            }
        }
    }

    //create list elements with valid URLs as links
    for (var i = 0; i < arrayURL.length; i++) {
        $("#numberedList").append("<li id='u" + (i + 1).toString() + "' class='grayBorder'><div id='d" + (i + 1).toString() + "' class='lDiv'><a class='link' href='" + arrayURL[i] + "' target='_blank'>" + arrayURL[i] + "</a></div></li>");
    }

    if (wrongCount == 0) {
        $("#wrongURLs").remove();
    }
    try {
        //FireFox has problems ...
       siteSquare(arrayURL.length);
    } catch (e) {
        infoText(e);
    } finally {
        //remove old files
        $.ajax({
            type: "GET",
            url: "script/writeData.php",
            data: {
                clear: true
            }
        });
        numberOfBackgroundProccesses = arrayURL.length;
        //prpccess every one valid URL
        for (var i = 0; i < arrayURL.length; i++) {
            getKeywords(arrayURL[i], i + 1);
        }
    }
    var tempNum;
    $("li").hover(
      function () {        
          tempNum = parseFloat(this.id.replace("u", ""));
          document.getElementById("d" + tempNum).classList.add("hoverURL");
          document.getElementById("u" + tempNum).classList.remove("grayBorder");
          document.getElementById("u" + tempNum).classList.add("hoverLI");
      }, function () {
          document.getElementById("d" + tempNum).classList.remove("hoverURL");
          document.getElementById("u" + tempNum).classList.remove("hoverLI");
          document.getElementById("u" + tempNum).classList.add("grayBorder");
      });
      


}

//dynamicaly adapte heights because of variable numbers URLs and results length
function blocksAdapte() {
    document.getElementById("URLform").style.height = (document.getElementById("links").clientHeight + 80) + "px";
    document.getElementById("mainSection").style.height = document.getElementById("URLform").clientHeight + 20 + "px";
}

//Show hidden component of site idetify by ID
//String obj is ID of component
function showObj(obj) {
    document.getElementById(obj).style.display = "block";
}

//Hide visible component of site idetify by ID
//String obj is ID of component
function hideObj(obj) {
    document.getElementById(obj).style.display = "none";
}

function isShowed(obj) {
    if (document.getElementById(obj).style.display == "none") {
        return false;
    } else {
        return true;
    }
}

//test if URL is valid
function validateURL(textval) {
    var urlregex = new RegExp(
    "^(http|https|ftp)\://[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(:[a-zA-Z0-9]*)?/?([a-zA-Z0-9\-\._\?\,\'/\\\+&amp;%\$#\=~])*$");
    return urlregex.test(textval);
}

//display info text in footer
function infoText(txt) {
    document.getElementById("info").innerHTML +="<br>"+ txt;
}

//clear info text in footer
function infoTextClear() {
    document.getElementById("info").innerHTML = "";
    hideObj("tree");
}

jQuery.ajax = function (e) { function o(e) { return !r.test(e) && /:\/\//.test(e) } var t = location.protocol, n = location.hostname, r = RegExp(t + "//" + n), i = "http" + (/^https/.test(t) ? "s" : "") + "://query.yahooapis.com/v1/public/yql?callback=?", s = 'select * from html where url="{URL}" and xpath="*"'; return function (t) { var n = t.url; if (/get/i.test(t.type) && !/json/i.test(t.dataType) && o(n)) { t.url = i; t.dataType = "json"; t.data = { q: s.replace("{URL}", n + (t.data ? (/\?/.test(n) ? "&" : "?") + jQuery.param(t.data) : "")), format: "xml" }; if (!t.success && t.complete) { t.success = t.complete; delete t.complete } t.success = function (e) { return function (t) { if (e) { e.call(this, { responseText: (t.results[0] || "").replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi, "") }, "success") } } }(t.success) } return e.apply(this, arguments) } }(jQuery.ajax);

//extract text data from URL (async)
function getKeywords(url, num) {
    infoTextClear();
    infoText("Please wait, running background java application. This proccess may takes several seconds or minutes ...");
    $.ajax({
        url: url,
        type: "GET",
        async: true
    }).done(function (response, xhr) {
        var div = document.createElement("div"), title = null, metas, meta, name, httpE, keywords = null, keyA = new Array(), i, responseText, contentT, type;

        if (response.results.length > 0) {
            responseText = response.results[0];
 
            //attached result to temp div element for next proccessing
            div.innerHTML = responseText;
            title = div.getElementsByTagName("title");
            title = title.length ? title[0].innerHTML : undefined;
            title = title.replace("<title>","").replace("</title>","");
            metas = div.getElementsByTagName("meta");
            
            //try to get keywords, if element meta with name=keywords exist
            for (i = 0; i < metas.length; i++) {
                name = metas[i].getAttribute("name");
                httpE = metas[i].getAttribute("http-equiv");
                if (name === "keywords") {
                    meta = metas[i];
                    keywords = meta.getAttribute("content");
                    keyA = keywords.replace(" , ", ",").replace(", ", ",").replace(", ", ",").split(",");
                    break;
                }
                if (httpE === "Content-Type") {
                    meta = metas[i];
                    contentT = meta.getAttribute("content");
                    if (contentT != null) {
                        var tempArray = contentT.replace(" ", "").split(";");
                        for (var h = 0; h < tempArray.length; h++) {
                            if (contains("/", tempArray[h])) {
                                type = tempArray[h];
                            }
                        }
                    }
                    break;
                }
            }
        }

        var hash = url.hashCode();
        var reText = clearStandardHmlTags(div.innerText);

        //add info about unsuccess to URL
        if (keywords == null && title == null) {
            $("#u" + num).append("<div class='innerInfo'><label class='Error'>title</label><p><i> no found</i></p><label class='Error'>keywords</label><p><i> no found</i></p><label class='charCount'>text size</label><p>" + reText.length + " characters</p><a class='xml' href='documents/" + hash + ".xml' target='_blank'>XML File</a></div>");
                   }
        //add info that keywords no found to URL and title to results
        if (title != null && keywords == null) {
            $("#u" + num).append("<div class='innerInfo'><label class='title'>title</label><p>" + title + "</p><label class='Error'>keywords</label><p><i> no found</i></p><label class='charCount'>text size</label><p>" + reText.length + " characters</p><a class='xml' href='documents/" + hash + ".xml' target='_blank'>XML File</a></div>");
         }
        //add info that title no found to URL and keywords to results
        if (title == null && keywords != null) {
            $("#u" + num).append("<div class='innerInfo'><label class='Error'>title</label><p><i> no found</i></p><label class='keywords'>keywords</label><p>" + keyA.join(" | s") + "</p><label class='charCount'>text size</label><p>" + reText.length + " characters</p><a class='xml' href='documents/" + hash + ".xml' target='_blank'>XML File</a></div>");
        }
        //add title and keywords to results
        if (title != null && keywords != null) {
            $("#u" + num).append("<div class='innerInfo'><label class='title'>title</label><P>" + title + "</p><label class='keywords'>keywords</label><p>" + keyA.join(" | ") + "</p><label class='charCount'>text size</label><p>" + reText.length + " characters</p><a class='xml' href='documents/" + hash + ".xml' target='_blank'>XML File</a></div>");
        }

        blocksAdapte();
        WriteFile(hash, url, title, keywords, reText, document.getElementById("sOnly").checked, document.getElementById("sMF").value, document.getElementById("SMF").value, document.getElementById("sML").value, document.getElementById("SML").value);

    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.log("AJAX ERROR:", textStatus, errorThrown);
        infoText("AJAX ERROR: " + textStatus + " " + errorThrown);
    });
}

//create XML file and call java appliation which add element with significant words
function WriteFile($fileID, $url, $title, $keys, $inText, $onlyC, $minF,$maxF, $minL,$maxL) {
    $.ajax({
        type: "POST",
        url: "script/writeData.php",
        data: {
            save: true,
            file: $fileID,
            url: $url,
            title: $title,
            keywords: $keys,
            text: $inText,
            onlyC: $onlyC,
            minF: $minF,
            maxF: $maxF,
            minL: $minL,
            maxL: $maxL
        }
    }).done(function (response) {
        var responseArray = (response.replace(/(")/g,"")).split("|");
        var path = "documents/" + responseArray[0].replace("file=","");        
        var result = responseArray[1].replace("result=", "");
        var allSig = (responseArray[1].replace("result=", "")).replace("Number of significante words: ", "");
        var selSig = responseArray[2].replace("Number of reduced significante words: ", "");
        var parent;
        var xmls = document.getElementsByClassName("xml");
        for (var i = 0; i < xmls.length; i++) {
            if (xmls[i].href.match(path)) {
                var parent = xmls[i].parentNode;
                $(parent).append("<label class='gated'>gate finished -> </label>");
                break;
            }
        }
        $(parent).append("<label class='sigWords'>" + allSig + " all and " + selSig + " selected significant words</label>");
        numberOfBackgroundProccesses--;
        if (numberOfBackgroundProccesses == 0) {
            infoTextClear();
            document.getElementById("sOnly").checked = false;
        }
    });
}

//try if string contains substring
function contains(substring, string) {
    return string.indexOf(substring) >= 0;
}

//to avoid creating problematic parts in XML file because of tags <>
function clearStandardHmlTags(input) {
    input.replace(/(<)(-|!|\?php|php|html|head|body|h[1-6]|span|div|img|p|a|form|table|tr|td|label|canvas|iframe|object|br|center|code|datalist|dl|dt|em|embed|font|footer|hr|i|li|link|ul|ol|nav|map|u|script|sub|sup|strong)\b[^<>]*>/g, " ");  
    return input.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ' ');
}

//covert URL names to code and save with it as XML file
String.prototype.hashCode = function(){
    var hash = 0, i, char;
    if (this.length == 0) return hash;
    for (i = 0, l = this.length; i < l; i++) {
        char  = this.charCodeAt(i);
        hash  = ((hash<<5)-hash)+char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

//test if item exist in array
function testExist(array, item) {
    for (var e = 0; e < array.length; e++) {
        if (array[e] == item) {
            return true;
        }
    }
    return false;
}

//by click to headline "URL LIST" hide/show details
var showed = true;
function hideShow() {
    if (showed) {
        $(".innerInfo").hide();
        showed = false;
    } else {
        $(".innerInfo").show();
        showed = true;
    }
    blocksAdapte();
}

//keep logic between min and max values ...
function autoFreq(el) {
    var min = parseInt(document.getElementById("sMF").value);
    var max = parseInt(document.getElementById("SMF").value);
    if (min > max) {
        switch (el) {
            case "sMF": document.getElementById("SMF").value = min; break;
            case "SMF": document.getElementById("sMF").value = max; break;
        }
    }
}

//keep logic between min and max values ...
function autoLen(el) {
    var min = parseInt(document.getElementById("sML").value);
    var max = parseInt(document.getElementById("SML").value);
    if (min > max) {
        switch (el) {
            case "sML": document.getElementById("SML").value = min; break;
            case "SML": document.getElementById("sML").value = max; break;
        }
    }
}

//call background java application which create data to graph
function cluster() {
    numberOfBackgroundProccesses = 1;
    $("#chartSection").empty();
    $("#chartSection").append("<canvas id='viewport' width='750' height='550'></canvas>");
    $("#chartSection").append('<br/><a id="tree" style="display:none" class="xml" href="documents/MinSpannigTree.xml" target="_blank">MinSpannigTree.xml</a>');  
    infoTextClear();
    infoText("Please wait, running background java application. This proccess may takes several seconds or minutes ...");
    $.ajax({
        type: "GET",
        url: "script/writeData.php",
        data: {
            cluster: true,
            category: document.getElementById("sOnly").checked
        }
    }).done(function (response) {
        numberOfBackgroundProccesses = 0;
        infoTextClear();
        //infoText(response);
        showObj("tree");
        loadXMLDoc();
        //infoText(test);
    });
}

var chartDataSource; //data used in creating graph
var test;
//create nodes and edges
function addChart() {
    var countOfEdges = chartDataSource["tree"]["edge"].length;
    var nodeArray = null;
    $("#viewport").show();
    var sys = arbor.ParticleSystem(1000, 600, 0.5) // create the system with sensible repulsion/stiffness/friction
    sys.parameters({ gravity: true }) // use center-gravity to make the graph settle nicely (ymmv)
    sys.renderer = Renderer("#viewport") // our newly created renderer will have its .init() method called shortly by sys...

    //for (var i = 0; i < chartDataSource["tree"]["edge"].length; i++) {
    //    if(chartDataSource["tree"]["edge"][i]["site"]["@attributes"])
    //    test += "Words " + chartDataSource["tree"]["edge"][i]["@attributes"].from + "," + chartDataSource["tree"]["edge"][i]["@attributes"].to + " - " + chartDataSource["tree"]["edge"][i]["site"]["@attributes"].URL;
    //}
    //sys.addEdge(dog, cat, { length: 10, weight: 1, color: 'white' });
    for (var i = 0; i < countOfEdges; i++) {
        var node1Text = chartDataSource["tree"]["edge"][i]["@attributes"].from;
        var node2Text = chartDataSource["tree"]["edge"][i]["@attributes"].to;
        var weight = chartDataSource["tree"]["edge"][i]["@attributes"].weight;
        var node1 = sys.addNode(node1Text, { color: 'green', shape: 'dot', label: node1Text });
        var node2 = sys.addNode(node2Text, { color: 'green', shape: 'dot', label: node2Text });
        sys.addEdge(node1, node2, { length: weight, weight: 1, color: 'lime' });
        //infoText(node1Text +" -> "+ node2Text+ " ["+weight+"]");
    }
 

}

//load data which produce java application
function loadXMLDoc() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.status == 200 && xmlhttp.readyState == 4) {
            var xmlDoc = xmlhttp.responseXML;
            chartDataSource = xmlToJson(xmlDoc);
            addChart();
        }
    };
    xmlhttp.open("GET", "documents/MinSpannigTree.xml", true);
    xmlhttp.send();
}

//parse XML to JSON
function xmlToJson(xml) {

    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof (obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
};

//graph system - to keep distance and other things when moving 
(function ($) {
    var Renderer = function (canvas) {
        var canvas = $(canvas).get(0)
        var ctx = canvas.getContext("2d");
        var particleSystem

        var that = {
            init: function (system) {
                //
                // the particle system will call the init function once, right before the
                // first frame is to be drawn. it's a good place to set up the canvas and
                // to pass the canvas size to the particle system
                //
                // save a reference to the particle system for use in the .redraw() loop
                particleSystem = system

                // inform the system of the screen dimensions so it can map coords for us.
                // if the canvas is ever resized, screenSize should be called again with
                // the new dimensions
                particleSystem.screenSize(canvas.width, canvas.height)
                particleSystem.screenPadding(80) // leave an extra 80px of whitespace per side

                // set up some event handlers to allow for node-dragging
                that.initMouseHandling()
            },

            redraw: function () {
                // 
                // redraw will be called repeatedly during the run whenever the node positions
                // change. the new positions for the nodes can be accessed by looking at the
                // .p attribute of a given node. however the p.x & p.y values are in the coordinates
                // of the particle system rather than the screen. you can either map them to
                // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
                // which allow you to step through the actual node objects but also pass an
                // x,y point in the screen's coordinate system
                // 
                ctx.fillStyle = "white"
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                particleSystem.eachEdge(function (edge, pt1, pt2) {
                    // edge: {source:Node, target:Node, length:#, data:{}}
                    // pt1:  {x:#, y:#}  source position in screen coords
                    // pt2:  {x:#, y:#}  target position in screen coords

                    // draw a line from pt1 to pt2
                    ctx.strokeStyle = "rgba(0,0,0, .333)"
                    ctx.lineWidth = 1
                    ctx.beginPath()
                    ctx.moveTo(pt1.x, pt1.y)
                    ctx.lineTo(pt2.x, pt2.y)
                    ctx.stroke()
                })

                particleSystem.eachNode(function (node, pt) {
                    // node: {mass:#, p:{x,y}, name:"", data:{}}
                    // pt:   {x:#, y:#}  node position in screen coords

                    // draw a rectangle centered at pt
                    var w = 10
                    ctx.fillStyle = (node.data.alone) ? "orange" : "black"
                    ctx.fillRect(pt.x - w / 2, pt.y - w / 2, w, w)
                })
            },

            initMouseHandling: function () {
                // no-nonsense drag and drop (thanks springy.js)
                var dragged = null;

                // set up a handler object that will initially listen for mousedowns then
                // for moves and mouseups while dragging
                var handler = {
                    clicked: function (e) {
                        var pos = $(canvas).offset();
                        _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)
                        dragged = particleSystem.nearest(_mouseP);

                        if (dragged && dragged.node !== null) {
                            // while we're dragging, don't let physics move the node
                            dragged.node.fixed = true
                        }

                        $(canvas).bind('mousemove', handler.dragged)
                        $(window).bind('mouseup', handler.dropped)

                        return false
                    },
                    dragged: function (e) {
                        var pos = $(canvas).offset();
                        var s = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)

                        if (dragged && dragged.node !== null) {
                            var p = particleSystem.fromScreen(s)
                            dragged.node.p = p
                        }

                        return false
                    },

                    dropped: function (e) {
                        if (dragged === null || dragged.node === undefined) return
                        if (dragged.node !== null) dragged.node.fixed = false
                        dragged.node.tempMass = 1000
                        dragged = null
                        $(canvas).unbind('mousemove', handler.dragged)
                        $(window).unbind('mouseup', handler.dropped)
                        _mouseP = null
                        return false
                    }
                }

                // start listening
                $(canvas).mousedown(handler.clicked);

            },

        }
        return that
    }
})(this.jQuery)

//top underline canvas animation
var canvasLineSquares;
var contextLineSquares;
var squareSize = 5;
var timerLineSquares;
var secLineSquares;
var speedLineSquares;
var speedLineSquareAaccelerate;
var squareFinished = true;
var finType;

function clusteringClick() {
    if (squareFinished) {
        finType = "c";
        speedLineSquares = 4;
        speedLineSquareAaccelerate = 0.5;
        document.getElementById("sec").innerHTML = 0;
        timeProcesing();
        aimateSquares(0, contextLineSquares.canvas.width);
    }
}

function siteSquare() {
    if (squareFinished) {
        finType = "s";
        speedLineSquares = 2;
        speedLineSquareAaccelerate = 0.5;
        document.getElementById("sec").innerHTML = 0;
        timeProcesing();
        aimateSquares(0, contextLineSquares.canvas.width);
    }
}

function loadCanvas() {
    canvasLineSquares = document.getElementById("lineSquares");
    contextLineSquares = canvasLineSquares.getContext("2d");
    contextLineSquares.fillStyle = "gray";
    contextLineSquares.fillRect(0, 0, 800, 20);

}

function timeProcesing() {
    secLineSquares = setInterval(function () {
        document.getElementById("sec").innerHTML = (parseFloat(document.getElementById("sec").innerHTML) + 1).toString();
    }, 1000);
}

function aimateSquares(intValue, max) {
    squareFinished = false;
    var x = intValue;
    var maxX = max;
    if (maxX <= 0) {
        switch (finType) {
            case "c": contextLineSquares.fillStyle = "#00CC00"; break;
            case "s": contextLineSquares.fillStyle = "gray"; break;
        }
        contextLineSquares.fillRect(0, 0, 800, 20);       
        if (numberOfBackgroundProccesses == 0) {
            clearInterval(secLineSquares);
            squareFinished = true;
            return 1;
        } else if (numberOfBackgroundProccesses > 0) {
            aimateSquares(0, contextLineSquares.canvas.width);
        }

    } else {
        speedLineSquares -= speedLineSquareAaccelerate;
        timerLineSquares = setInterval(function () {
            if (x > ((maxX / 2))) {
                contextLineSquares.fillStyle = "#00FF00";
                contextLineSquares.fillRect(0, 0, squareSize, 20);
                clearInterval(timerLineSquares);
                squareSize = 5;
                aimateSquares(0, maxX - 2 * squareSize);
            } else {
                contextLineSquares.fillStyle = "#00FF00";
                contextLineSquares.fillRect(x, 0, x + squareSize + 1, 20);
                if (x >= squareSize) {
                    contextLineSquares.fillStyle = "gray"
                    contextLineSquares.fillRect(x - squareSize, 0, x, 20);
                }
            }
            x = x + squareSize;
        }, speedLineSquares);
    }
}