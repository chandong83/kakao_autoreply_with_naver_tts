//음성 출력용 패키지
var lame = require('lame');
var Speaker = require('speaker');
//네이버 TTS 용 패키지 웹 요청 용
var request = require('request');

//카카오톡 파싱용 패키지
var bodyParser = require('body-parser');
//웹 패키지
var express    = require('express');
var app        = express();

//네이버 KEY
var client_id = '당신의 네이버 API ID';
var client_secret = '당신의 네이버 API 암호키';
//목소리 미진 음성
var voiceModel = 'mijin';
//목소리 속도 보통
var voiceSpeed = '0';
//네이버 tts URL
var api_url = 'https://openapi.naver.com/v1/voice/tts.bin';

// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//초기 상태 get '시작'' 버튼으로 시작
app.get('/keyboard', function(req, res){
  const menu = {
      "type": 'buttons',
      "buttons": ["시작"]
  };

  res.set({
      'content-type': 'application/json'
  }).send(JSON.stringify(menu));
});

//카톡 메시지 처리
app.post('/message',function (req, res) {

    const _obj = {
        user_key: req.body.user_key,
        type: req.body.type,
        content: req.body.content
    };

    console.log(_obj.content)

    /// 네이버 TTS 데이터 받기
    var options = {
        url: api_url,
        //'TEXT에 카톡에서 받은 테스트 전달'
        form: {'speaker':voiceModel, 'speed':voiceSpeed, 'text':_obj.content},
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
     };

     //네이버 TTS 데이터 요청
     var _req = request.post(options).on('response', function(response) {
       console.log('code ' + response.statusCode) // 200

     });
     //바로 스트리밍과 연결하여 출력!
     _req.pipe(new lame.Decoder())
       .on('format', function (format) {
         this.pipe(new Speaker(format));
       });

    //카톡으로 전송되는 메시지
    let massage = {
        "message": {
            "text": '(' + _obj.content + ')' + ' 을 따라 말했습니다.'
        },
    };

    //카톡에 메시지 전송
    res.set({
        'content-type': 'application/json'
    }).send(JSON.stringify(massage));

});

//9000포트 서버 ON
app.listen(9000, function() {
});
