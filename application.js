window.spotifyModule = {
  //artist arrays
  metalArtists: [
    "A Day To Remember",
    "August Burns Red",
    "Alexisonfire",
    "As I Lay Dying",
    "Architects",
    "Breaking Benjamin",
    "Baroness",
    "Bleed From Within",
    "Bring Me The Horizon",
    "Counterparts",
    //"Chevelle",
    "Dance Gavin Dance",
    "Dayseeker",
    "Dead and Divine",
    "Defeater",
    "Deftones",
    "The Devil Wears Prada",
    "Enter Shikari",
    "Erra",
    "The Ghost Inside",
    "Haste the Day",
    "Heart in Hand",
    //"Issues",
    "Killswitch Engage",
    "La Dispute",
    "Lamb Of God",
    "Letlive.",
    "Like Moths to Flames",
    "Mastodon",
    "Misery Signals",
    "Miss May I",
    "Norma Jean",
    "Northlane",
    "Of Mice & Men",
    "Parkway Drive",
    "Silent Planet",
    "Texas in July",
    "We Came as Romans"

  ],

  altArtists: [
    "Alt-J",
    "The Beatles",
    "Bon Iver",
    "Chromeo",
    "Circa Survive",
    "City and Colour",
    "Coheed And Cambria",
    "Emarosa",
    "The Foals",
    "Foo Fighters",
    "Glassjaw",
    "Incubus",
    "Jimi Hendrix",
    "Kings Of Leon",
    "The Kooks",
    "Led Zeppelin",
    "A Loss For Words",
    "Lydia",
    //"Manchester Orchestra",
    "Minus the Bear",
    "The Mars Volta",
    "Modest Mouse",
    "Pink Floyd",
    "Saosin",
    "Spoon",
    "Rage Against the Machine",
    "Red Hot Chili Peppers",
    "The Temper Trap",
    "Two Door Cinema Club",
    "Young the Giant"
  ],

  rapArtists: [
    "Childish Gambino",
    "Chris Brown",
    "Drake",
    "Fetty Wap",
    "Future",
    "Gucci Mane",
    "J. Cole",
    "Juicy J",
    "Kanye West",
    "Kendrick Lamar",
    "Kid Cudi",
    "L\'Orange",
    "Mac Miller",
    "Schoolboy Q",
    "Ty Dolla $ign",
    "Tyler, The Creator",
    "The Weeknd",
    "Wiz Khalifa",
    "2 Chainz",
    "2Pac"
  ],

  //empty album array to keep record of the albums pulled
  albumArray: [],
  //init function
  init: function() {
    var self = this;
    //for each of the artists in the array, run an ajax function
    //these each need to be their own funciton for scope
    $.each(self.metalArtists, function(index, artist) {
      self.callAjax(artist, "metal");
    })
    
    $.each(self.altArtists, function(index, artist) {
      self.callAjax(artist, "alt");
    })
    
    $.each(self.rapArtists, function(index, artist) {
      self.callAjax(artist, "rap");
    })
  },
  //actual call ajax function
  callAjax: function(artist, type) {
    var self = this;
    //ajax to spotify
    $.ajax({        
      url: 'https://api.spotify.com/v1/search?',
      data: {
        q: 'artist:' + artist,
        type: 'album',
        market: "US"
      },
      //onsuccess run formatter
      success: function(response) {
        self.formatAlbums(response, artist, type);
      },

      error: function() { 
        console.log("An unkown error occured getting this info"); 
      }
    });
  },
  //format albums
  formatAlbums: function(response, artist, type) {
    var albumWrapper = $(".albumWrapper");
    var self = this;

    $.each(response.albums.items, function(i, item) {
      //console.log(item);

      //if its a single, skip it
      if(item.album_type === "single") {
        return;
      }
      //fancy ass regex to filter out any "deluxe" albums, etc
      for(var i = 0; i < self.albumArray.length; i++) {
        //regex finds anything inside parenthesis, and a space before the first parenthesis, and replaces it with nothing
        if((self.albumArray[i].indexOf(item.name.replace(/\s\(([^)]+)\)/, ""))) >= 0) {
          return;
          break;
        }
      }
      //our content
      var content = "<div class='album " + item.name.toLowerCase().replace(/\s+/g, "") + " " + artist.toLowerCase().replace(/\s+/g, "") + "' data-album-url='" + item.href + "' style='background: url(" + item.images[1].url + "); width: " + item.images[1].width + "px; height: " + item.images[1].height + "px;' data-genre='" + type + "'><div class='overlay'></div><div class='info'><span>" + artist + "</span><br><span>" + item.name + "</span></div></div>";
      //add that shit to the dom, and push the current album to the album array to check for duplicates
      albumWrapper.append(content);
      self.albumArray.push(item.name.replace(/\(([^)]+)\)/, ""));
    });
  },
  //if we click on an album cover, this will run
  viewAlbum: function(albumURL) {
    var self = this;

    $.ajax({        
      url: albumURL,

      success: function(response) {
        self.formatModal(response);
      },

      error: function() { 
        console.log("An unkown error occured getting this info"); 
      }
    });
  },

  formatModal: function(response) {
    //console.log(response);
    
    var self = this,
        modal = $(".albumModal"),
        tracks = "";
    //empty modal
    modal.html("");

    $.each(response.tracks.items, function(i, item) {
      //console.log(item);

      tracks += "<div data-audio='" + item.preview_url + "' class='track track-" + item.track_number + "'><span class='trackNumber'>" + item.track_number + ". </span><span class='trackName'>" + item.name + "</span><span class='time'>" + self.msToMinutes(item.duration_ms) + "</span></div>";
    });

    var content = "<div class='modalContents'><i class='fa fa-close'></i><i class='playPause fa'></i><div class='albumart' style='background: url(" + response.images[1].url + "); width: " + response.images[1].width + "px; height: " + response.images[1].height + "px;'></div><div class='info'><span>" + response.name + "</span><span>" + response.artists[0].name + "</span><span>" + self.convertDate(response.release_date, response.release_date_precision) + "</span></div><div class='tracks'>" + tracks + "</div></div>";

    modal.html(content).show();
    $(".modalOverlay").show();
    $("body").css("overflow", "hidden");
  },

  msToMinutes: function(ms) {
    var self = this,
        ms = ms;

    ms = 1000*Math.round(ms/1000); // round to nearest second
    var d = new Date(ms);

    return(d.getUTCMinutes() + ':' + self.addZero(d.getUTCSeconds()));
  },

  addZero: function(number) {
    if (number < 10) {
      number = "0" + number;
    }
    return number;
  },
  
  convertDate: function(date, accuracy) {
    if(accuracy === "day") {
      var dateArray = [];
      var newDate = date;
      
      newDate = new Date(newDate).toUTCString();
      newDate = newDate.split(" ");
      dateArray.push(newDate);      
      newDate = (dateArray[0][0] + " " + dateArray[0][2] + " " + dateArray[0][1] + " " + dateArray[0][3]);
      
      return newDate;
      
    } else {
      return date;
    }
  }
}
//toggle play pause module
window.togglePlayPause = {
  boolean: false,

  toggle: function() {
    if(this.boolean == false) {
      $(".playPause").removeClass("pause").addClass("play");
      $(".audio").trigger('play');
      this.boolean = true;
    } else {
      $(".playPause").removeClass("play").addClass("pause");
      $(".audio").trigger('pause');
      this.boolean = false;
    }
  },

  play: function(source, $this) {    
    this.boolean = true;
    $(".playing").removeClass("playing");
    $this.addClass("playing");
    $(".playPause").addClass("play");
    $(".audio").attr("src", source).trigger('play');
  },

  pause: function() {    
    this.boolean = false;
    $(".playing").removeClass("playing");
    $(".playPause").removeClass("play").removeClass("pause");
    $(".audio").trigger('pause');
  }
} 
//---------------------------------
// End Modules
//---------------------------------

//---------------------------------
// Watchers
//---------------------------------
//all our click watchers
var watchers = function() {
  $(".album").click(function() {
    var albumUrl = $(this).attr('data-album-url');
    window.spotifyModule.viewAlbum(albumUrl);

  });

  $(".track").click(function() {
    var $this = $(this);
    var source = $this.attr("data-audio");

    if($(".audio").attr("src") === source) {
      window.togglePlayPause.toggle();
    } else {
      window.togglePlayPause.play(source, $this);
    }
  });

  $(".modalOverlay, .fa-close").click(function() {
    $(".modalOverlay, .albumModal").hide();
    $("body").css("overflow", "visible");
    window.togglePlayPause.pause();
  });

  $(".playPause").click(function() {
    window.togglePlayPause.toggle();
  });
  
  /*var timeoutClear;
  $(".searchInput").keyup(function() {
    var keyword = $(this).val().toLowerCase();

    clearTimeout(timeoutClear);
    timeoutClear = setTimeout(function() {

      if(keyword || !keyword === "undefined") {
            
      }
    },1000);
  });*/
}
//init on doc ready
$(function() {
  window.spotifyModule.init();
});
//have to wait for ajax to finish before we put a watcher on the album class
//or else it wont see it in the dom, and wont run
$(document).ajaxStop(function() {
  //console.log("true");
  watchers();
});