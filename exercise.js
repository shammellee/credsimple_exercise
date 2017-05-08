"use strict";

var app = {};

app.start = function(records)
{
  var max_record_count          = 30
      ,first_records            = []
      ,record_elements          = []
      ,valid_records            = []
      ,expired_records          = []
      ,today                    = new Date()
      ,record_list              = get_by_id('record_list')
      ,record_container         = document.createDocumentFragment()
      ,months                   = 'Jan:Feb:Mar:Apr:May:Jun:Jul:Aug:Sep:Oct:Nov:Dec'.split(':')
      ,selected_record          = null
      ,selected_item_class      = 'record__selected'
      ,detail_query_class       = '.record_container__detail'
      ,detail_hidden_class      = 'record_container__detail__hidden'
      ,hidden_class             = 'hidden'
      ,invisible_class          = 'invisible'
      ,expired_records_visible  = true
      ,filter_expired_btn       = get_by_id('button__filter_expired')
      ,filter_expired_label     = filter_expired_btn.querySelector('.button_label__filter_expired')
      ,filter_expired_show_text = 'Include expired'
      ,filter_expired_hide_text = 'Exclude expired'
      ,dark_theme               = {class_name:'theme__dark',text:'Dark'}
      ,light_theme              = {class_name:'theme__light',text:'Light'}
      ,theme_toggle_btn         = get_by_id('button__theme_toggle')
      ,dea_number_toggle        = get_by_id('checkbox__dea_number_toggle')
      ,npi_toggle               = get_by_id('checkbox__npi_toggle')
      ,provider_id_toggle       = get_by_id('checkbox__provider_id_toggle')
      ,dea_number_tables        = []
      ,npi_tables               = []
      ,provider_id_tables       = []
      ,record_filter            = get_by_id('record_filter')
      ,record_filter_interval   = 150  // milliseconds
      ,no_records_message       = get_by_id('message__no_records');
      ;

  if(expired_records_visible)
  {
    filter_expired_label.textContent = filter_expired_hide_text;
  }else
  {
    filter_expired_label.textContent = filter_expired_show_text;
  }

  // -------
  // HELPERS
  // -------

  function get_by_id(id)
  {
    return document.getElementById(id);
  }


  // ---------------
  // PROCESS RECORDS
  // ---------------

  // Parse expiration date
  for(var i = 0,size = records.length;i < size;i++)
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

  function toggle_expired_records(event)
  {
    var filter_expired_label = event.currentTarget.querySelector('.button_label__filter_expired')
        ,filter_label_text   = filter_expired_label.textContent
        ;

    if(!expired_records_visible)
    {
      // Show expired records
      for(var i = 0,size = expired_records.length;i < size;i++)
      {
        var detail_container = expired_records[i]
                                 .querySelector(detail_query_class);

        // Deselect expired items, if any
        deselect_record(expired_records[i]);
        show(expired_records[i]);
      }

      filter_expired_label.textContent = filter_expired_hide_text;
      expired_records_visible          = true;
      filter_visible_records();
    }else
    {
      // Hide expired records
      for(var i = 0,size = expired_records.length;i < size;i++)
      {
        hide(expired_records[i]);
      }

      filter_expired_label.textContent = filter_expired_show_text;
      expired_records_visible          = false;
    }
  }

  function toggle_theme(event)
  {
    var theme_root = document.body
        ,button    = event.currentTarget;
        ;

    if(theme_root.classList.contains(dark_theme.class_name))
    {
      remove_class(theme_root,dark_theme.class_name);
      add_class(theme_root,light_theme.class_name);
      button.textContent = 'Show ' + dark_theme.text + ' Theme';
    }else
    {
      remove_class(theme_root,light_theme.class_name);
      add_class(theme_root,dark_theme.class_name);
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
        remove_class(node_array[i],class_name);
      }
    }else
    {
      for(var i = 0; i < size; i++)
      {
        add_class(node_array[i],class_name);
      }
    }
  }

  function record_filter_value_changed(event)
  {
    window.setTimeout(function()
    {
      filter_visible_records();

      record_filter.addEventListener(
        'input'
        ,record_filter_value_changed
        ,{once:true,capture:false}
      );
    },record_filter_interval);
  }

  function filter_visible_records()
  {
    var filter_term = record_filter.value;

    deselect_record(selected_record);

    if(expired_records_visible)
    {
      filter_records(record_elements,filter_term);
    }else
    {
      filter_records(valid_records,filter_term);
    }
  }

  function filter_records(records,filter_term)
  {
    var filter_regex          = new RegExp(filter_term,'i')
        ,matched_record_count = 0
        ;

    conceal(no_records_message);

    for(var i = 0,size = records.length; i < size; i++)
    {
      var record_title = records[i].getAttribute('title');

      hide(records[i]);

      if(filter_regex.test(record_title))
      {
        show(records[i]);
        matched_record_count++;
      }
    }

    matched_record_count === 0 && reveal(no_records_message);
  }

  function show(element)
  {
    remove_class(element,hidden_class);
  }

  function hide(element)
  {
    add_class(element,hidden_class);
  }

  function reveal(element)
  {
    remove_class(element,invisible_class);
  }

  function conceal(element)
  {
    add_class(element,invisible_class);
  }

  function add_class(element)
  {
    var class_names = [].slice.call(arguments,1);

    for(var i = 0,size = class_names.length; i < size; i++)
    {
      element.classList.add(class_names[i]);
    }
  }

  function remove_class(element)
  {
    var class_names = [].slice.call(arguments,1);

    for(var i = 0,size = class_names.length; i < size; i++)
    {
      element.classList.remove(class_names[i]);
    }
  }

  function toggle_record(event)
  {
    var record = event.currentTarget.parentNode;

    // If item was not the previously selected item
    if(!record.classList.contains(selected_item_class))
    {
      deselect_record(selected_record);
      select_record(record);
    }else
    {
      deselect_record(selected_record);
    }
  }

  function select_record(record)
  {
    if(record)
    {
      // Set selected item to current item
      selected_record = record;

      // Add selected class
      add_class(selected_record,selected_item_class);

      // Show details
      remove_class(
        selected_record.querySelector(detail_query_class)
        ,detail_hidden_class
      );
    }
  }

  function deselect_record(record)
  {
    if(
      record
      && record.classList.contains(selected_item_class)
    )
    {
      // Remove selected class
      remove_class(record,selected_item_class);

      // Hide details
      add_class(
        record.querySelector(detail_query_class)
        ,detail_hidden_class
      );

      // Clear selected item
      selected_record = null;
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
    add_class(table,'detail_table');

    if(class_name && class_name != '')
    {
      add_class(table,class_name);
    }

    table.setAttribute('cellpadding',0);
    table.setAttribute('cellspacing',0);
    add_class(header_cell,'detail_table_cell__header');
    header_cell.textContent = header_text;
    add_class(value_cell,'detail_table_cell__value')
    value_cell.textContent = value;

    return table;
  }

  // BUILD RECORD LIST ITEMS
  for(var i = 0,size = first_records.length;i < size;i++)
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
        ,record             = document.createElement('li')
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

    add_class(record,'record');
    record.setAttribute('title',first_records[i].name);

    record_elements.push(record);

    if(!valid)
    {
      add_class(record,'record__expired');
      if(!expired_records_visible){hide(record);}
      expired_records.push(record);
    }else
    {
      valid_records.push(record);
    }

    // MAIN CONTAINER
    add_class(main_container,'record_container__main');
    main_container.addEventListener('click',toggle_record,false);


    // Avatar
    add_class(avatar,'record_image__avatar');
    main_container.appendChild(avatar);

    // Name
    name_label.textContent = first_records[i].name;
    add_class(name_label,'record_label__name');
    main_container.appendChild(name_label);

    // Expired
    expired_label.textContent = 'Expired';

    if(valid)
    {
      hide(expired_label);
    }else
    {
      add_class(expired_label,'record_label__record_expired');
      add_class(detail_container,'record_container__detail__expired');
    }

    main_container.appendChild(expired_label);
    record.appendChild(main_container);

    // DETAIL CONTAINER
    add_class(
      detail_container
      ,'record_container__detail'
      ,'record_container__detail__hidden'
    );

    detail_container.appendChild(dea_number_table);
    detail_container.appendChild(npi_table);
    detail_container.appendChild(provider_id_table);
    detail_container.appendChild(exp_date_table);

    dea_number_tables.push(dea_number_table);
    npi_tables.push(npi_table);
    provider_id_tables.push(provider_id_table);

    record.appendChild(detail_container);

    record_container.appendChild(record);
  }

  conceal(no_records_message);
  record_list.appendChild(record_container);
  reveal(record_list);

  // EVENTS
  // Toggle theme
  theme_toggle_btn.addEventListener('click',toggle_theme,false);

  // Toggle record detail properties
  dea_number_toggle.addEventListener('change',function(event)
  {
    batch_toggle_class_name(dea_number_tables,hidden_class);
  },false);

  npi_toggle.addEventListener('change',function(event)
  {
    batch_toggle_class_name(npi_tables,hidden_class);
  },false);

  provider_id_toggle.addEventListener('change',function(event)
  {
    batch_toggle_class_name(provider_id_tables,hidden_class);
  },false);

  // Toggle expired records filter
  filter_expired_btn.addEventListener('click',toggle_expired_records,false);

  // Filter records
  record_filter.addEventListener(
    'input'
    ,record_filter_value_changed
    ,{once:true,capture:false}
  );

  // ----------------
  // END CONFIGURE UI
  // ----------------
};

window.onload = (function()
{
  cs_api.getData(app.start);
})();
