LOC = location
IsDebug = LOC["port"] is "9000"

BASE_API_PATH = "/api/index.php"

API = 
  user: "/user/usersession/user"
  userInfo: "/user/userinfo/user/id" # 1
  ask: "/ask/askinfo/ask"
  answer: "/ask/askinfo/answer"
  news: "/feed/feedinfo/feeds"
  notice: "/common/message/msgcount"

  myask: "/user/me/myask"
  myanswer: "/user/me/myanswer"
  mylove: "/user/me/mylove"

  askme: "/ask/askinfo/asks"
  follow: "/user/friend/follow"
  unfollow: "/user/friend/unfollow"
  loveanswer: "/ask/askinfo/loveanswer"
  answerme: "/feed/feedinfo/answerme"
  comment: "/ask/askinfo/comment"
  getComment: "/ask/askinfo/comments"
  loveme: "/user/feedinfo/loveanswers"
  commentme: "/feed/feedinfo/commentme"
  lovemefeed: "/feed/feedinfo/loveme"

  friendAsk: "/user/friend/asks"
  friendAns: "/user/friend/answers"
  frinedLove: "/user/friend/loveanswers"

  friendFollow: "/user/friend/follows"
  friendFans: "/user/friend/followeds"

  askinfo: "/ask/askinfo/ask"
  askanswers: "/ask/askinfo/answers"

  reg: "/user/userinfo/user"

  squareask: "/ask/askinfo/answers"

  squareusers: "/user/userinfo/users"

  aboutsite: "/common/info/siteinfo"

  weiboLogin: "/user/saeauth/login"
  weiboLoginCb: "/user/saeauth/callback"



if IsDebug
  BASE_API_PATH = "/data"

  API = 
    user: "/user"
    userInfo: "/user-info"
    ask: "/ask"
    answer: "/answer"
    news: "/news"

    myask: "/myask"
    myanswer: "/myanswer"
    mylove: "/mylove"

    notice: "/msgcount"
    askme: "/askme"
    follow: "/follow"
    unfollow: "/unfollow"
    loveanswer: "/loveanswer"
    answerme: "/answerme"
    comment: "/comment"
    getComment: "/comments_list"
    loveme: "/loveanswers"
    commentme: "/commentme"
    lovemefeed: "/loveme"

    friendAsk: "/myask"
    friendAns: "/myanswer"
    frinedLove: "/mylove"

    friendFollow: "/follows"
    friendFans: "/follows"

    askinfo: "/askinfo"
    askanswers: "/askanswers"

    reg: "/reg"

    squareask: "/squareask"

    squareusers: "/squareusers"

    aboutsite: "/siteinfo"

    weiboLogin: "/weibologin"
    weiboLoginCb: "/weibologincallback"

  API[n] += ".json" for n, v of API

API[api] = "#{BASE_API_PATH}#{API[api]}" for api of API