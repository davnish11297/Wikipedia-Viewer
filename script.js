$(document).ready(function(){
  
  var base_url = 'https://en.wikipedia.org/w/api.php?action=query';
  var results = "&generator=search&gsrnamespace=0&gsrlimit=8&prop=extracts|info&inprop=url&exchars=150&exintro&exlimit=max&explaintext&gsrsearch=";
  var random = '&prop=extracts|info&exchars=250&inprop=url&generator=random&grnnamespace=0&grnlimit=1&explaintext';
  var options = "&format=json&callback=?"; // &callback=? enables JSONP mode, for cross-domain requests
  var cont = '&continue=gsroffset%7C%7C&gsroffset=';
  var search, gsroffset ,continueEnabled, $out_ul;

  
  $('#ajaxloader').hide();

  // jQueryUI Autocomplete
  $("#in").autocomplete({
    source : function(request,response){
      var autocomp_url = '&prop=info&generator=allpages&gaplimit=8&gapfrom=' 
      autocomp_url = base_url + autocomp_url + (encodeURIComponent(request.term)+options);
      $.getJSON(autocomp_url,{},function(data){
        var obj = data.query.pages;
        var edited_data = [];
        for (var prop in obj){
          edited_data.push(obj[prop].title);
        }
        response(edited_data);
      }).fail(function(){response([])});
    }
  });
  
  $('#in').keypress(function(event){
    if(event.which == 13)     // if ENTER is pressed on input
      $('#sub').click();      // triggers a click on submit btn
  });
  
  $(".btn").click(function(){
    var validSearch = true;
    switch ($(this).attr('id')){
      case 'sub' :{
        search = $("#in").val();
        if(!search)
          validSearch = false;
        $('#in').autocomplete('close');
        var completeUrl = base_url + results + encodeURIComponent(search) + options;
        break;
      }
      case 'rnd' :{
        $("#in").val('');
        completeUrl = base_url + random + options;
        break;
      }
    }
    if(validSearch){
      $('div#ajaxloader').show();
      $out_ul = $("<ul></ul>").addClass('list-unstyled custom');
      $('.out').empty().append($out_ul);
      queryAndAppend(completeUrl,$out_ul);
    }
  });
 
  function queryAndAppend(url,$where){
    return $.getJSON(url,{},function(data){
      var obj = data.query.pages;      
      for (var prop in obj){
        var $new_a = $('<a target="_blank" href="' + obj[prop].fullurl + '">')
        var $new_li = $('<li></li>').hide();
        $new_a.append($new_li);
        $new_li.append($('<h3 class="li-title"></h3>').text(obj[prop].title));
        $new_li.append($("<p></p>").text(obj[prop].extract));
        $where.append($new_a);
        $new_li.fadeIn();
      }
      // setup continue search for infinite scroll
      if(data.continue){
        gsroffset = data.continue.gsroffset;
        continueEnabled = true;
      }else
        continueEnabled = false
     $('div#ajaxloader').hide();
     }).fail(function(xhr,text,err){
      $where.append($('<li class="text-center"></li>').append($('<h3></h3>').text('Error Performing API Request')));
      $('div#ajaxloader').hide();
    });
  }

  // Simple Infinite Scroll 
  $(window).scroll(function()
  {
      var wintop = $(window).scrollTop(), docheight = $(document).height(), winheight = $(window).height();
      var  scrolltrigger = 0.98;
      if  ((wintop/(docheight-winheight)) >= scrolltrigger) {
        if(continueEnabled){
          continueEnabled = false;
          $('div#ajaxloader').show();
          var completeUrl =  base_url + results + encodeURIComponent(search) + options + cont + gsroffset;
          queryAndAppend(completeUrl,$out_ul);
        }
      }
  });
});
