"use strict";

var app = {};

app.start = function(records)
{
  var max_record_count     = 30
      ,first_records       = []
      ,today               = new Date()
      ,record_list         = get_by_id('record_list')
      ,list_item_container = document.createDocumentFragment()
      ,months              = 'Jan:Feb:Mar:Apr:May:Jun:Jul:Aug:Sep:Oct:Nov:Dec'.split(':')
      ,selected_list_item  = null
      ,filter_expired_btn  = get_by_id('button__filter_expired')
      ,theme_toggle_btn    = get_by_id('button__theme_toggle')
      ,dea_number_toggle   = get_by_id('checkbox__dea_number_toggle')
      ,npi_toggle          = get_by_id('checkbox__npi_toggle')
      ,provider_id_toggle  = get_by_id('checkbox__provider_id_toggle')
      ,dea_number_tables   = []
      ,npi_tables          = []
      ,provider_id_tables  = []
      ;


  function get_by_id(id)
  {
    return document.getElementById(id);
  }


  // ---------------
  // PROCESS RECORDS
  // ---------------

  // Parse expiration date
  for(var i = 0,len = records.length;i < len;i++)
  {
    var date_parts = records[i].expiration_date.split('-')
        ,exp_year  = date_parts[0]
        ,exp_month = date_parts[1] - 1
        ,exp_day   = date_parts[2]
        ;

    records[i].exp_date_parsed = new Date(exp_year,exp_month,exp_day);

    // Add "valid" property that tells if the expiration date is after today
    records[i].valid = records[i].exp_date_parsed > today;
  }

  // Sort records by expiration date
  records.sort(function(record_1,record_2)
  {
    return record_1.exp_date_parsed - record_2.exp_date_parsed;
  });

  // Limit record count to value specified by "max_record_count" above
  first_records = records.slice(0,max_record_count);

  // ------------------
  // END PROCESS RECORDS
  // ------------------


  // ------------
  // CONFIGURE UI
  // ------------

  function toggle_expired(event)
  {
    var filter_expired_label = event.currentTarget.querySelector('.button_label__filter_expired')
        ,filter_label_text   = filter_expired_label.textContent
        ,expired_records     = record_list.querySelectorAll('.list_item__expired')
        ,detail_query_class  = '.list_item_container__detail'
        ,detail_hidden_class = 'list_item_container__detail__hidden'
        ;

    if(filter_label_text == 'Show Expired')
    {
      // Show expired records
      for(var i = 0,len = expired_records.length;i < len;i++)
      {
        var detail_container = expired_records[i].querySelector(detail_query_class);

        // Deselect expired items, if any
        expired_records[i].classList.remove('list_item__selected');
        detail_container.classList.add(detail_hidden_class);

        expired_records[i].classList.remove('hidden');
      }

      filter_expired_label.textContent = 'Hide Expired';
    }else
    {
      // Hide expired records
      for(var i = 0,len = expired_records.length;i < len;i++)
      {
        expired_records[i].classList.add('hidden');
      }

      filter_expired_label.textContent = 'Show Expired';
    }

  }

  function toggle_theme(event)
  {
    var theme_root   = document.body
        ,dark_theme  = {class_name:'theme__dark',text:'Dark'}
        ,light_theme = {class_name:'theme__light',text:'Light'}
        ,button      = event.currentTarget;
        ;

    if(theme_root.classList.contains(dark_theme.class_name))
    {
      theme_root.classList.remove(dark_theme.class_name);
      theme_root.classList.add(light_theme.class_name);
      button.textContent = 'Show ' + dark_theme.text + ' Theme';
    }else
    {
      theme_root.classList.remove(light_theme.class_name);
      theme_root.classList.add(dark_theme.class_name);
      button.textContent = 'Show ' + light_theme.text + ' Theme';
    }
  }

  function batch_toggle_class_name(node_array,class_name)
  {
    var size = node_array.length;

    if(node_array[0].classList.contains(class_name))
    {
      for(var i = 0; i < size; i++)
      {
        node_array[i].classList.remove(class_name);
      }
    }else
    {
      for(var i = 0; i < size; i++)
      {
        node_array[i].classList.add(class_name);
      }
    }
  }

  function create_detail_table(header_text,value,class_name)
  {
    var table        = document.createElement('table')
        ,header      = table.createTHead()
        ,header_row  = header.insertRow()
        ,header_cell = document.createElement('th')
        ,value_row   = table.insertRow()
        ,value_cell  = value_row.insertCell()
        ;

    header_row.appendChild(header_cell);
    table.classList.add('detail_table');
    if(class_name && class_name != '')
    {
      table.classList.add(class_name);
    }
    table.setAttribute('cellpadding',0);
    table.setAttribute('cellspacing',0);
    header_cell.classList.add('detail_table_cell__header');
    header_cell.textContent = header_text;
    value_cell.classList.add('detail_table_cell__value')
    value_cell.textContent = value;

    return table;
  }

  function select_list_item(event)
  {
    var list_item            = event.currentTarget.parentNode
        ,selected_item_class = 'list_item__selected'
        ,detail_query_class  = '.list_item_container__detail'
        ,detail_hidden_class = 'list_item_container__detail__hidden'
        ;

    // If item was previously selected (selected twice)
    if(list_item.classList.contains(selected_item_class))
    {
      // Remove selected class
      list_item
        .classList
        .remove(selected_item_class);

      // Hide details
      list_item
        .querySelector(detail_query_class)
        .classList
        .add(detail_hidden_class);
    }else
    {
      // If selected item exists
      if(selected_list_item)
      {
        // Remove selected class
        selected_list_item
          .classList
          .remove(selected_item_class)

        // Hide details
        selected_list_item
          .querySelector(detail_query_class)
          .classList
          .add(detail_hidden_class)
          ;
      }

      // Set selected item to current item
      selected_list_item = list_item;

      // Add selected class
      selected_list_item
        .classList
        .add(selected_item_class)
        ;

      // Show details
      selected_list_item
        .querySelector(detail_query_class)
        .classList
        .remove(detail_hidden_class)
        ;
    }
  }

  // BUILD RECORD LIST ITEMS
  for(var i = 0,len = first_records.length;i < len;i++)
  {
    var dea_number          = first_records[i].dea_number
        ,npi                = first_records[i].npi
        ,provider_id        = first_records[i].provider_id
        ,exp_year           = first_records[i].exp_date_parsed.getFullYear()
        ,exp_month_index    = first_records[i].exp_date_parsed.getMonth()
        ,exp_month          = months[exp_month_index]
        ,exp_day            = first_records[i].exp_date_parsed.getDate()
        ,exp_date_formatted = exp_month + ' ' + exp_day + ', ' + exp_year
        ,valid              = first_records[i].valid
        ,list_item          = document.createElement('li')
        ,main_container     = document.createElement('div')
        ,avatar             = document.createElement('span')
        ,name_label         = document.createElement('span')
        ,expired_label      = document.createElement('span')
        ,detail_container   = document.createElement('div')
        ,dea_number_table   = create_detail_table('DEA #',dea_number,'detail_table__dea_number')
        ,npi_table          = create_detail_table('NPI',npi,'detail_table__npi')
        ,provider_id_table  = create_detail_table('Provider ID',provider_id,'detail_table__provider_id')
        ,exp_date_table     = create_detail_table('Expiration Date',exp_date_formatted,'detail_table__expiration_date')
        ;

    list_item.classList.add('list_item');
    list_item.setAttribute('title',first_records[i].name);
    if(!valid){list_item.classList.add('list_item__expired','hidden');}

    // MAIN CONTAINER
    main_container.classList.add('list_item_container__main');
    main_container.addEventListener('click',select_list_item,false);

    // Avatar
    avatar.classList.add('list_item_image__avatar');
    main_container.appendChild(avatar);

    // Name
    name_label.textContent = first_records[i].name;
    name_label.classList.add('list_item_label__name');
    main_container.appendChild(name_label);

    // Expired
    expired_label.textContent = 'Expired';

    if(valid)
    {
      expired_label.classList.add('hidden');
    }else
    {
      expired_label.classList.add('list_item_label__record_expired');
      detail_container.classList.add('list_item_container__detail__expired');
    }

    main_container.appendChild(expired_label);
    list_item.appendChild(main_container);

    // DETAIL CONTAINER
    detail_container
      .classList
      .add('list_item_container__detail','list_item_container__detail__hidden');

    detail_container.appendChild(dea_number_table);
    detail_container.appendChild(npi_table);
    detail_container.appendChild(provider_id_table);
    detail_container.appendChild(exp_date_table);

    dea_number_tables.push(dea_number_table);
    npi_tables.push(npi_table);
    provider_id_tables.push(provider_id_table);

    list_item.appendChild(detail_container);

    list_item_container.appendChild(list_item);
  }

  record_list.appendChild(list_item_container);

  // EVENTS
  // Toggle theme
  theme_toggle_btn.addEventListener('click',toggle_theme,false);

  // Toggle record details
  dea_number_toggle.addEventListener('change',function(event)
  {
    batch_toggle_class_name(dea_number_tables,'hidden');
  },false);

  npi_toggle.addEventListener('change',function(event)
  {
    batch_toggle_class_name(npi_tables,'hidden');
  },false);

  provider_id_toggle.addEventListener('change',function(event)
  {
    batch_toggle_class_name(provider_id_tables,'hidden');
  },false);

  // Toggle expired records filter
  filter_expired_btn.addEventListener('click',toggle_expired,false);

  // ----------------
  // END CONFIGURE UI
  // ----------------
};

window.onload = (function()
{
  cs_api.getData(app.start);
})();
