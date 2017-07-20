'use strict';

var simple_dea = (function()
{
  function random(min, max)
  {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var formats = {
    expiration_date: function()
    {
      var date   = new Date()
          ,year  = date.getFullYear()
          ,month = random(1, 12)
          ,day   = random(1,31)
          ;

      return year + '-' + month + '-' + day;
    }
    ,dea_number: function()
    {
      var characters               = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('')
          ,max_index               = characters.length - 1
          ,total_output_characters = 11
          ,output                  = ''
          ;

      while(output.length < total_output_characters)
      {
        output += characters[random(0,max_index)];
      }

      return output.toUpperCase();
    }
  };

  jsf.format(formats);

  var api = {
    get_data: function(callback)
    {
      var schema = {
        type: 'array'
        ,minItems: 30
        ,maxItems: 50
        ,items: {
          type: 'object'
          ,properties: {
            name: {
              type: 'string'
              ,faker: 'name.findName'
            }
            ,expiration_date: {
              type: 'string'
              ,format: 'expiration_date'
            }
            ,dea_number: {
              type: 'string'
              ,format: 'dea_number'
            }
            ,npi: {
              type: 'integer'
              ,minimum: 100
              ,maximum: 999
            }
            ,provider_id: {
              type: 'integer'
              ,minimum: 100000
              ,maximum: 999999
            }
          }
          ,required: [
            'name'
            ,'expiration_date'
            ,'dea_number'
            ,'npi'
            ,'provider_id'
          ]
        }
      };

      var data = jsf(schema);

      callback(data);
    }
  };

  return api;
})();
