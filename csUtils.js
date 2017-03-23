"use strict";

var cs_api = (function()
{
  var api       = {}
      ,base_url = 'https://dea.staging.credsimple.com'
      ,id       = 20
      ,path     = '/v1/clients_providers/'
      ,token    = '3ad6aef59ee542ec881c5bc6593ba9c3'
      ;

  api.getData = function(callback)
  {
    var request      = new XMLHttpRequest()
        ,request_url = base_url + path + id + '?token=' + token
        ;

    request.open('GET',request_url,true);

    request.onload = function()
    {
      var response = JSON.parse(request.response);

      callback(response);
    };

    request.onerror = function(e)
    {
      callback(request.response,e);
    };

    request.send();
  };

  return api;
}());
