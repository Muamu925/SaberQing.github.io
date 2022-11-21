/**
 * iframe
 * iframe 2019-02-25
 * for pc
 */
var YK = {};
window.YKU = {};
YK.https = location.protocol;
var YKP = {
  playerType: "",
  playerState: {
    PLAYER_STATE_INIT: 'PLAYER_STATE_INIT',
    PLAYER_STATE_READY: 'PLAYER_STATE_READY',
    PLAYER_STATE_AD: 'PLAYER_STATE_AD',
    PLAYER_STATE_PLAYING: 'PLAYER_STATE_PLAYING',
    PLAYER_STATE_END: 'PLAYER_STATE_END',
    PLAYER_STATE_ERROR: 'PLAYER_STATE_ERROR'
  },
  playerCurrentState: 'PLAYER_STATE_INIT',
  isLoadFinishH5: false,
  isPC: true,
  videoList: [],
  isAndroidYouku: false
};
var StaticDomain = YK.https + "//player.youku.com";
function browserRedirect() {
  var sUserAgent = navigator.userAgent.toLowerCase();
  var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
  var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
  var bIsIphone = sUserAgent.match(/iphone/i) == "iphone";
  var bIsMidp = sUserAgent.match(/midp/i) == "midp";
  var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
  var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
  var bIsAndroid = sUserAgent.match(/android/i) == "android";
  var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
  var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
  if (bIsIpad || bIsIphoneOs || bIsIphone || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
    YKP.isPC = false;
  } else {
    YKP.isPC = true;
  }
  var bIsYouku = sUserAgent.match(/youku/i) == "youku";
  if (bIsAndroid) {
    if (bIsYouku) {
      YKP.isAndroidYouku = true;
    }
  }
  if (bIsIphone) {
    if (bIsYouku) {
      YKP.isIphoneYouku = true;
    }
  }
}
browserRedirect();
var urlParameter = function(object) {
  var arr = [];
  for (var o in object) {
    arr.push(o + '=' + object[o]);
  }
  return arr.join('&');
};

function parseJsonStr(str) {
  if ('string' != typeof str) {
    return str;
  }
  if (/{[^{^}]{0,}}/.test(str)) {
    try {
      str = JSON.parse(str);
    } catch (e) {

    }
  }
  return str;
}

var dynamicLoading = {
  css: function(path) {
    if (!path || path.length === 0) {
      throw new Error('argument "path" is required !');
    }
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.href = path;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    head.appendChild(link);
  },
  js: function(path, obj, attr) {
    if (!path || path.length === 0) {
      throw new Error('argument "path" is required !');
    }
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.src = path;
    script.type = 'text/javascript';
    if (attr) {
      script["id"] = attr["id"];
      script.setAttribute('pageType', attr["pageType"]);
      script.setAttribute('isHidden', attr["isHidden"]);
    }
    head.appendChild(script);
    script.onload = function() {
      if (obj) {
        obj.selectH5();
        YKP.isLoadFinishH5 = true;
      }
    }
  }
}

dynamicLoading.css(YK.https + "//player.youku.com/unifull/css/unifull.min.css?v=20180810");
var YoukuPlayerSelect = function(params) {
  YK.initConfig = params;
  this._vid = params.vid;
  this._target = params.target;
  this._partnerId = params.partnerId;
  this._videoFlag = params.videoFlag;
  if (params.client_id) {
    //兼容openapi中的client_id的设置
    this._partnerId = params.client_id;
  }
  if (!(this._vid && this._target && this._partnerId)) {
    alert(
      "[Fail]The params of {vid,target,client_id} are necessary !"
    );
    return;
  }
  this._events = params.events ? params.events : {};
  if (params.onPlayStart) {
    this._events.onPlayStart = params.onPlayStart;
  }
  if (params.onPlayEnd) {
    this._events.onPlayEnd = params.onPlayEnd;
  }
  YK.playerEvents = params.events;
  this._id = params.id;
  if (this._id == null) this._id = "youku-player";
  YKP.playerId = this._id;
  this._width = params.width;
  this._height = params.height;
  this._expand = params.expand;
  if (params.width == null || params.height == null) {
    //宽高指定不全，默认为0
    if (params.expand == null) {
      this._expand = 0;
    }
  } else {
    //宽高都指定，默认为1
    if (params.expand == null) {
      this._expand = 1;
    }
  }
  this._starttime = params.starttime;
  this._password = params.password;
  this._poster = params.poster;
  this._autoplay = !!params.autoplay; // 0 ,1 ,true ,false,'true','false'..
  this._canWide = params.canWide;
  if ('undefined' != typeof params.show_related) {
    this._showRelated = !!params.show_related;
  }
  this._embed_content = params.embed_content;
  this._embed_vid = params.embed_vid;
  this._cancelFullScreen = params.cancelFullScreen;
  this._titleStyle = params.titleStyle;
  this._source = params.source;
  this._newPlayer = params.newPlayer;
  this._winType = params.wintype;
  this._doubleSpeed = params.doubleSpeed;
  this._isAutoplayMute = params.isAutoplayMute;
  this._ckey = params.ckey;

  //播放页专门参数
  this._playlistconfig = params.playlistconfig;
  this._isMobile = YKP.isMobile;
  this._isMobileIOS = YKP.isMobileIOS;
  //this._weixin = params.weixin;
  YK.isWeixin = YKP.isWeixin; //false;
  //微信专用参数
  if ('undefined' != typeof params.weixin) {
    YK.isWeixin = !!params.weixin; //!!å¤–éƒ¨ä¼ å…¥ weixin=fasle ä¹Ÿå¯ä»¥ç”Ÿæ•ˆ
  }
  this._loop = !!params.loop || false;
  // more ..
  this._playerType = "";
};
YoukuPlayerSelect.prototype = {
  isPC: function() {
    return YKP.isPC;
  },
  select: function() {
    this.selectHandler();
  },
  selectHandler: function() {
    var url;
    if (this.isPC()) {
      var container = document.querySelector('#' + this._target);
      if (navigator.appName == "Microsoft Internet Explorer" && parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE", "")) < 10) {
        container.innerHTML = '很抱歉！由于您的浏览器版本太低，暂无法观看，<br>请下载高版本浏览器';
        container.style.color = '#ffffff';
        container.style.backgroundColor = '#000000';
        return;
      }
      dynamicLoading.js(YK.https + "//g.alicdn.com/alilog/mlog/aplus_o.js");
      dynamicLoading.js(YK.https + "//r1.ykimg.com/material/0A03/h5sdk/dev/v1_2_5/yksdk.js");
      if (this._doubleSpeed) {
        url = YK.https + "//player.youku.com/unifull/js/youku-player_double.umd.min.js";
      } else {
        url = YK.https + "//player.youku.com/unifull/js/youku-player.umd.min.js?v=20190417";
      }

    } else {
      dynamicLoading.js(YK.https + "//g.alicdn.com/ku/ykbannerLoader/1.01.26/js/ykbannerLoader.min.js", null, {
        "id": "ykbannerLoader",
        "pageType": "player",
        "isHidden": true
      });
      url = YK.https + "//player.youku.com/unifull/js/unifull.min.js?v=0125";
    }
    if (YKP.isLoadFinishH5) {
      this.selectH5();
    } else {
      dynamicLoading.js(url, this);
    }


    if (this._events && this._events.onPlayerReady) {
      var callback = this._events.onPlayerReady;
      if (YKP.playerType == "h5") {
        var check = setInterval(function() {
          try {
            callback();
          } catch (e) {}
          clearInterval(check);
        }, 500);
      } else if (YKP.playerType == 'flash') {
        var check = setInterval(function() {
          try {
            callback();
          } catch (e) {

          }
          clearInterval(check);
        }, 500);
      } else {

      }
    }
  },
  selectH5: function() {
    if (YKP.isPC) {
      this.selectPCH5();
    } else {
      this.selectMobileH5();
    }
  },

  selectMobileH5: function() {
    var self = this;
    var playerDom = document.getElementById(this._target);
    if (this._width > 0 && this._height > 0) {
      playerDom.style.width = this._width + "px";
      playerDom.style.height = this._height + "px";
    } else {
      var cw = playerDom.offsetWidth;
      var ch = playerDom.offsetHeight;
      function resize(playerDom) {
        playerDom.style.width = cw + "px";
        playerDom.style.height = ch + "px";
      }
      resize(playerDom);
    }

    var closeFullFullScreen = 0;
    if (self._cancelFullScreen == 1 && YKP.isAndroidYouku) {
      closeFullFullScreen = 1;
    }

    var config = {
      videoId: self._vid, //视频id
      ccode: "0590", //渠道id
      client_id: self._partnerId, //优酷视频云创建应用的client_id
      control: {
        laguange: "", //默认使用的语言类型
        hd: "mp4hd", //默认使用的码率
        //   hd:"m3u8",
        autoplay: false //是否自动播放
      },
      logconfig: {

      }, //统计扩展参数，包括aplus接口中的全局对象时数据，用于传递给统计接口
      adConfig: {

      }, //广告扩展参数
      password: self._password, //视频播放密码，用于加密视频（这个是否可以传入暂定）
      wintype: "", //每端固定的参数，多用于统计，不确定是否还需要
      type: "", //播放类型（pc,pad,mobile）暂定,
      events: self._events,
      embed_vid: self._embed_vid,
      embed_content: self._embed_content,
      titleStyle: self._titleStyle,
      source: self._source,
      closeFullFullScreen: closeFullFullScreen,
      isIphoneYouku: YKP.isIphoneYouku,
      imgPoster: self._poster
    };
    this._h5player = YKPlayer.Player(this._target, config);
  },
  isWchartBroser: function() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
      return true;
    } else {
      return false;
    }
  },
  selectPCH5: function() {
    var self = this;
    var videoType = self.isWchartBroser() ? 'mp4' : 'hls';
    var container = document.querySelector('#' + self._target);
    if (self._width > 0 && self._height > 0) {
      container.style.width = self._width + "px";
      container.style.height = self._height + "px";
    } else {
      var cw = container.offsetWidth;
      var ch = container.offsetHeight;
      container.style.width = cw + "px";
      container.style.height = ch + "px";
    }
    var playerObj;
    if (self._doubleSpeed) {
      playerObj = {
        ccode: "0512",
        winType: "BDskin",
        vid: self._vid,
        autoplay: self._autoplay,
        //supportType:videoType,
        hasWatermark: false,
        limitVideo: 3,
        Keyboard: {
          disablefullScreen: true
        },
        supportType: videoType,
        upsRequestType: 'mtop',
        ckey: self._ckey,
        customParam: {
          client_id: self._partnerId,
          //   client_id:'ab21028283353f20',
          password: self._password
        },

        playBackRateInfo: {
          show: true,
          rateList: [, {
            rate: 16
          }, {
            rate: 8
          }, {
            rate: 4
          }, {
            rate: 2
          }, {
            rate: 1.5
          }, {
            rate: 1,
            text: '正常',
            isDefault: true
          }, {
            rate: 0.5,
          }, {
            rate: 0.3,
          }, {
            rate: 0.1,
          }]
        }
      };
      if (YK.https == "https:") {
        playerObj.supportType = "mp4";
      }
    } else {
      playerObj = {
        events:{
            onReady:function(){
              // 根据self._isAutoplayMute值判断是否静音自动播放
              if(self._isAutoplayMute){
                  pcPlayer._manage.setMuted(true);
                  pcPlayer.play();
              }
          }
        },
        ccode: "0512",
        winType: "BDskin",
        vid: self._vid,
        autoplay: self._autoplay,
        ckey: self._ckey,
        supportType: videoType,
        customParam: {
          client_id: self._partnerId,
          //   client_id:'ab21028283353f20',
          password: self._password
        }
      };
      if (YK.https == "https:") {
        playerObj.supportType = "mp4";
      }
    }
    var pcPlayer = new YoukuPlayer(container, playerObj);

    var obj;
    var state;
    pcPlayer.testPlay = function(){
       pcPlayer.play();
    }

    pcPlayer.on('onPlayerStart', function(data) {
      obj = {
        msg: 'onPlayStart'
      }
      window.parent.postMessage(obj, '*');
    });
    pcPlayer.on('PlayerPlayNext', function(data) {
      console.log('------PlayerPlayNext');
    });
    pcPlayer.on('onTrialEnd', function() {
      console.log('------onTrialEnd');

    });
    pcPlayer.on('onPlayerSet', function(obj) {
    });
    pcPlayer.on('onPlayerComplete', function(data) {
      obj = {
        msg: 'onPlayEnd'
      }
      window.parent.postMessage(obj, '*');
    });
    pcPlayer.on('playerSubscribe', function(callback, uid) {
      console.log('------playerSubscribe');
      callback();
    });
    pcPlayer.on('dashboardStateChange', function(hide) {
    });
    pcPlayer.on('onTimeUpdate', function(data) {
      //console.log(data);
      var currentTime = pcPlayer.getCurrentTime();
      obj = {
        msg: 'onTimeUpdate',
        time: currentTime
      };
      window.parent.postMessage(obj, '*');
    });

    pcPlayer.on('Play', function(data) {
      //console.log('------onTimeUpdate||');
      obj = {
        msg: 'state',
        stateParam: "play"
      }
      window.parent.postMessage(obj, '*');
      //   console.log(state);
    });

    pcPlayer.on('Pause', function(data) {
      //console.log('------onTimeUpdate||');
      obj = {
        msg: 'state',
        stateParam: "pause"
      }
      window.parent.postMessage(obj, '*');
      //  console.log(state);
    });

    pcPlayer.on('playerReady', function(data) {
      obj = {
        msg: 'playerReady',
        param: pcPlayer
      }
      window.parent.postMessage(obj, '*');
      console.log('ready');
    });

    pcPlayer.on('reay', function(data){
      obj = {
        msg: 'reay',
        param: pcPlayer
      }
      window.parent.postMessage(obj, '*');
      console.log('reay');
    });

    pcPlayer.on('onFullscreen', function(data){
      obj = {
         msg: 'onFullscreen',
         param: data
      }
      window.parent.postMessage(obj, '*');
    })
    //test
    self.pctest = 'pctest';
    self.pcPlayer = pcPlayer;
    window.addEventListener('message', function(e){
      var data = e.data;
      if(data === 'play'){
         self.pcPlayer.play();
      }else if(data === 'pause'){
         self.pcPlayer.pause();
      }else if(data === 'dashboardHide'){
         self.pcPlayer.dashboardHide();
      }else if(data === 'dashboardShow'){
         self.pcPlayer.dashboardShow();
      }else{

      }
      //e.source.postMessage('get', '*');
    }, false)
  },
  onorientationchange: function() {
    //var self = this;
    var playerDom = document.getElementById(this._target);
    setTimeout(function() {
      var cw = document.documentElement.clientWidth;
      var ch = document.documentElement.clientHeight;
      playerDom.style.width = cw + "px";
      playerDom.style.height = 9 * cw / 16 + "px";

    }, 300);
  },
  isThirdParty: function() {

    var cid = this._partnerId;
    if (cid != null && (cid + '').length == 16) {
      return true;
    };

    return false;
  },
};

/**
 * 以下是统一的接口，用于外部统一操作 Flash 和 H5播放器
 *   直接传入参数进行初始化
 *    -- api document --
 *   //open.youku.com/docs/api/player
 *   用户名：api
 *   密码：youkuopenapi
 *
 */
YKU.Player = function(target, config) {
  config.target = target;
  this.select =  new YoukuPlayerSelect(config);
  this.select.select();
  this._player = "";
};
YKU.Player.prototype = {
  player: function() {
    if (this._player != "") {
      return this._player;
    }
    if (YKP.isPC) {
      this._player = new YKFlashPlayer();
    } else {
      this._player = new YKH5Player(this.select._h5player);
    }
    return this._player;
  },
  //@deprecated
  resize: function(dom, width, height) {
    if (dom && Number(width) && Number(height)) {
      dom.style ? dom.style.width = width + 'px' : null;
      dom.style ? dom.style.height = height + 'px' : null;
    } else {
      console.log('resize方法不可用,缺少参数!');
    }
  },
  currentTime: function() {
    return this.player().currentTime();
  },
  totalTime: function() {
    return this.player().totalTime();
  },
  playVideo: function() {
    this.player().playVideo();
  },
  startPlayVideo: function() {
    this.player().startPlayVideo();
  },
  pauseVideo: function() {
    this.player().pauseVideo();
  },
  seekTo: function(timeoffset) {
    this.player().seekTo(timeoffset);
  },
  hideControls: function() {
    this.player().hideControls();
  },
  showControls: function() {
    this.player().showControls();
  },
  /** mute:function(){},
   unmute:function(){},
   setVolume:function(){},
   getVideoMetaData:function(){},*/
  playVideoById: function(vid) {
    this.player().playVideoById(vid);
  },
  //special api for youku h5,not open api
  switchFullScreen: function() {
    try {
      this.player().switchFullScreen();
    } catch (e) {

    }

  }

};

var YKFlashPlayer = function() {
  this._player = document.getElementById(YKP.playerId);
};
YKFlashPlayer.prototype = {
  resize: function(width, height) {
    this._player.style.width = width + 'px';
    this._player.style.height = height + 'px';
  },
  currentTime: function() {
    var arr = this._player.getPlayerState().split("|");
    if (arr.length >= 3)
      return arr[2];
    else
      return -1;
  },
  totalTime: function() {
    var arr = this._player.getPlayerState().split("|");
    if (arr.length >= 4)
      return arr[3];
    else
      return -1;
  },
  playVideo: function() {
    this._player.play(false);
  },
  pauseVideo: function() {
    this._player.pauseVideo(true);
  },
  seekTo: function(timeoffset) {
    this._player.nsseek(timeoffset);
  },
  playVideoById: function(vid) { //encoded vid  å­—ç¬¦ä¸²å½¢å¼çš„vid
    this._player.playVideoByID(vid);
  },
  hideControls: function() {
    this._player.showControlBar(false);
  },
  showControls: function() {
    this._player.showControlBar(true);
  },
  state: function() {
    this._player.state();
  }
};

/**
 * @param player  YoukuHTML5Player
 */
var YKH5Player = function(player) {

  this._player = player;
};
YKH5Player.prototype = {
  currentTime: function() {
    return this._player.currentTime;
  },
  totalTime: function() {
    return this._player.totalTime;

  },
  playVideo: function() {
    this._player.play();
  },

  pauseVideo: function() {
    this._player.pause();
  },

  seekTo: function(timeoffset) {
    try {
      //  this._player.currentTime = timeoffset;
      this._player.seek(timeoffset);
    } catch (e) {}
  }
}

function executeScript(){
    var _scripts = document.getElementsByTagName("script"),_len = _scripts.length;
    for(var i = 0 ; i < _len ;i++){
        if(_scripts[i].src.indexOf("//player.youku.com/jsapi") > -1){
            if(_scripts[i].innerHTML){
              console.log('%c优酷视频云:播放器初始化代码，请单独在新的script标签内。否则会造成无法播放！','color:red');
              eval(_scripts[i].innerHTML);
              break;
            }
        }
    }
}
executeScript();
