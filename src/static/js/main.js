/* main.js
 * @author: Censyu
 * @date: 19/9/14
 */
var id;
var data;
var data_ready = false;

$(document).ready(function () {
    id = getURLParameter('id');
    if (id) {
        $(".login span").text("CHECK SCORE");
        ajaxURL = "http://202.38.73.8:80/score/" + id
        loadAnim(true);
        $.ajax({
            url: ajaxURL,
            timeout: 5000, // TODO: set proper timeout
            success: function (msg) {
                console.log('get data:' + msg);
                loadAnim(false);
                data = msg; // FIXME: give it to outter var??
                data_ready = true;
                if (typeof(msg["status"]) != "undefined") {
                    // showScore(msg);
                    $(".header h1").text("Hi, " + msg["姓名"]);
                }
                else {
                    showError("Error: 查询失败", msg["msg"]);
                }
            }, 
            error: function () {
                loadAnim(false);
                showError("Error: 连接错误", "呃呃，连接服务器超时了...可以尝试重新登录!");
            } 
        });
    }
    setTimeout(function () {
        $("h1").addClass("jello-horizontal");
    }, 500);
});

$(".login").on("click", function () {
    console.log("click login");
    // var ticket = getURLParameter('ticket');
    // if (ticket) {
    //     // redirect to api
    //     console('get ticket:' + ticket);
    //     var jumpURL = apiURL.URLFormat(ticket);
    // } else {
        if(id) {
            // get & show score using ajax
            if (data_ready) {
                showScore(data);
            }
            else {
                getScore(id);
            }
        }
        else {
            // redirect to cas
            var jumpURL = casURL.URLFormat(serviceURL);
            window.location.href = jumpURL;
        }
    // }
});

var serviceURL = "http://home.ustc.edu.cn/~gpzlx1/cas/index.html";
var apiURL = "http://202.38.73.8:80/login/cas/{0}";
var casURL = "https://passport.ustc.edu.cn/login?service={0}";

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

String.prototype.URLFormat = function(){
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function (a, num) {
        return encodeURI(args[num]) || a
    });
}

function getScore(id) {
    if (id) {
        loadAnim(true);
        ajaxURL = "http://202.38.73.8:80/score/" + id
        $.ajax({
            url: ajaxURL,
            timeout: 5000, // TODO: set proper timeout
            success: function (msg) {
                console.log('get data:' + msg);
                loadAnim(false);
                data = msg; // FIXME: give it to outter var??
                data_ready = true;
                if (msg["status"]) {
                    // showScore(msg);
                    setTitle("Hi, " + msg["姓名"]);
                }
                else {
                    showError("Error: 查询失败", msg["msg"]);
                }
            }, 
            error: function () {
                loadAnim(false);
                showError("Error: 连接错误", "呃呃，连接服务器超时了...可以尝试重新登录!");
            } 
        });
    }
}

function showScore(msg) {
    console.log('show score: ');
    console.log(msg);
    $('.modal-title').text(msg["姓名"] + "同学的成绩");
    for (var i = 0; i < 10; i++) {
        var item_key = $('#score tbody tr:eq(' + i + ') td:eq(0)').text();
        if (msg[item_key]) {
            $('#score tbody tr:eq(' + i + ') td:eq(1)').text(msg[item_key]);
        }
    }
    $('#score').modal('show');
}

function showError(title, msg) {
    $(".toast .toast-header strong").text(title);
//    $(".toast .toast-body").text(msg);
    $(".toast .toast-body").html(msg + '<a href="http://202.38.73.8:80">重新登录</a>');
    $(".toast").toast('show');
    setTitle("Error!");
}

function loadAnim(status) {
    console.log('loading...');
    if (status) {
        $(".header h1").text("Now Loading...");
        $('.spinner-border').css('display', 'inline-block');
    }
    else {
        $('.spinner-border').css('display', 'none');
    }
}

function setTitle(title) {
    $(".header h1").removeClass("jello-horizontal");
    $(".header h1").text(title);
    setTimeout(function () {
        $(".header h1").addClass("jello-horizontal");
    }, 10);
    
}