$(document).ready(function() {
	BigTreeCustomControls();
	BigTreePageLoadHooks.init();
	//BigTreeQuickLoader.init();
	
	// !BigTree Quick Search
	$('nav.main form .qs_query').keyup(function(ev) {
		var v = $(this).val();
		if (v && ev.keyCode != 9) { //no tabs!
			$("#quick_search_results").load("admin_root/ajax/quick-search-results/", { query: v }, function() {
				$("#quick_search_results").show();
			});
		} else {
			$("#quick_search_results").hide().html("");
		}
	}).focus(function() {
		$(this).addClass("focus");
	}).blur(function() {
		setTimeout("$('nav.main form input[type=\"search\"]').removeClass(\"focus\").val(\"\"); $(\"#quick_search_results\").fadeOut(200, function() { $(this).html(\"\"); });", 300);
	});
	$("nav.main").on("click",".advanced_search",function() {
		$("#quick_search_results").parents().submit();
		return false;
	});

	// Subnav extras menu
	$("#sub_nav menu").hover(function() {
		$(this).parent().addClass("dropdown_open");
	},function() {
		$(this).parent().removeClass("dropdown_open");
	});

	// Growl Hooks
	$("#growl").on("click",".close",function() {
		$(this).parents("article").remove();

		return false;
	});
});

function BigTreeCustomControls(selector) {
	var parent = (typeof selector == "undefined") ? $("body") : $(selector);

	parent.find("input[type=checkbox]").each(function() {
		if (!$(this).hasClass("custom_control")) {
			this.customControl = new BigTreeCheckbox(this);
		}
	});
	parent.find("select").each(function() {
		if (!$(this).hasClass("custom_control")) {
			this.customControl = new BigTreeSelect(this);
		}
	});
	parent.find("input[type=file]").each(function() {
		if (!$(this).hasClass("custom_control")) {
			this.customControl = new BigTreeFileInput(this);
		}
	});
	parent.find("input[type=radio]").each(function() {
		if (!$(this).hasClass("custom_control")) {
			this.customControl = new BigTreeRadioButton(this);
		}
	});
}

var BigTreePageLoadHooks = (function($) {

	var StickyControls = { $el: false, stuck: false, top: false };

	function init() {

		// !BigTree Link Finder
		$("#link_finder").keyup(function() {
			var q = $(this).val();
			if (q == "") {
				$("#link_finder_results").hide().html("");
			} else {
				$("#link_finder_results").load("admin_root/ajax/link-finder/", { query: q }, function() {
					$("#link_finder_results").show().children("a").click(function() { return false; });
				});
			}
		});
		
		// !BigTree Sticky Controls
		StickyControls.$el = $(".sticky_controls");
		if (StickyControls.$el.length) {
			StickyControls.top = StickyControls.$el.offset().top;
			
			if (window.scrollY >= StickyControls.top && !StickyControls.stuck) {
				StickyControls.stuck = true;
				StickyControls.$el.addClass("stuck");
			}
			
			$(window).scroll(function() {
				if (window.scrollY >= StickyControls.top && !StickyControls.stuck) {
					StickyControls.stuck = true;
					StickyControls.$el.addClass("stuck");
				}
				if (window.scrollY < StickyControls.top && StickyControls.stuck) {
					StickyControls.stuck = false;
					StickyControls.$el.removeClass("stuck");
				}
			});
		}
	
		// Property Block Hide/Show
		$("h3.properties").click(function() {
			if ($(this).find(".icon_small").hasClass("icon_small_caret_right")) {
				// Set a cookie to keep it open next time.
				$.cookie("bigtree_admin[page_properties_open]","on", { expires: 365, path: "/" });
			} else {
				$.cookie("bigtree_admin[page_properties_open]","", { path: "/" });
			}
			$(this).find(".icon_small").toggleClass("icon_small_caret_right").toggleClass("icon_small_caret_down");
			$(".property_block").toggle().next().toggle();
			return false;
		});
	
		$(".inset_block .hide").click(function() {
			var id = $(this).attr("data-id");
			$.cookie("bigtree_admin[ignore_view_description][" + id + "]","on", { expires: 365, path: "/" });
			$(this).parent().hide();
		});
		
		// Tooltips
		$(".has_tooltip").each(function() {
			var width = BigTree.WindowWidth();
			var offset = $(this).offset();
			if (offset.left > (width / 2)) {
				var position = "left";
			} else {
				var position = "right";
			}
			new BigTreeToolTip($(this),$(this).attr("data-tooltip"),position,false,true);
		});
	
		BigTree.FormHooks(".container form");
	}

	return { init: init }
}(jQuery));

var BigTreePasswordInput = function(element) {
	return (function($,element) {

		var Buffer;
		var Element = $(element);
		var FakeElement;

		function blur() {
			Buffer = FakeElement.val();
			FakeElement.val(str_repeat("•",FakeElement.val().length));
		}

		function change() {
			Element.val(FakeElement.val());
		}

		function focus() {
			FakeElement.val(Buffer);
		}

		// Init routine
		if (Element.hasClass("custom_control")) {
			return false;
		}

		FakeElement = $('<input type="text" />').attr("tabindex",$(element).attr("tabindex"));
		FakeElement.on("blur",blur).focus(focus).change(change);
		FakeElement.get(0).className = Element.get(0).className;
		Element.addClass("custom_control").hide().after(FakeElement);

		return { Element: Element, FakeElement: FakeElement };

	})(jQuery,element);
};

var BigTreeCheckbox = function(element) {
	return (function($,element) {

		var Element = $(element);
		var Link = false;

		function blur() {
			Link.removeClass("focused");
		};

		function clear() {
			Element.removeAttr("checked");
			Link.removeClass("checked");
		};

		function click() {
			if (!Element.attr("disabled")) {
				if (Link.hasClass("checked")) {
					Link.removeClass("checked");
					Element.attr("checked",false);
				} else {
					Link.addClass("checked");
					Element.attr("checked","checked");
				}
				Element.triggerHandler("click");
				Element.triggerHandler("change");
			}
			return false;
		};
	
		function disable() {
			Link.addClass("disabled");
			Element.attr("disabled","disabled");
		};
		
		function enable() {
			Link.removeClass("disabled");
			Element.removeAttr("disabled");
		};

		function focus() {
			if (!Element.attr("disabled")) {
				Link.addClass("focused");
			}
		};
		
		function keydown(event) {
			if (event.keyCode == 32) {
				click();
				return false;
			}
		};

		// Init routine
		if (Element.hasClass("custom_control")) {
			return false;
		}

		// Have label clicks affect the checkbox but let links inside of the labels still work properly
		Element.addClass("custom_control")
			   .next("label").click(click)
			   .find("a").click(function(ev) { ev.stopPropagation(); });
		
		// Create our clickable fake checkbox
		Link = $("<a>").attr("href","#checkbox").click(click).focus(focus).blur(blur).keydown(keydown);

		if (element.checked) {
			Link.addClass("checked");
		}
		
		if (element.disabled) {
			Link.addClass("disabled")
				.attr("tabindex","-1");
		} else if (element.tabIndex) {
			Link.attr("tabindex",element.tabIndex);
		}
		
		$(element).hide().after($('<div class="checkbox">').append(Link));

		return { Element: Element, Link: Link, blur: blur, clear: clear, click: click, disable: disable, enable: enable, focus: focus };

	})(jQuery,element);
};

var BigTreeSelect = function(element) {
	return (function($,element) {

		var Container = $("<div>").addClass("select");
		var Element = $(element);
		var Open = false;
		var Options = [];
		var WasRelative = false;

		function add(value,text) {
			// Add to the actual select.
			Element.get(0).options[Element.get(0).options.length] = new Option(text,value);
			// Add to the styled select.
			var a = $('<a href="#">' + text + '</a>').attr("data-value",value);
			Container.find(".select_options").append(a);
	
			// Test the size of this new element and see if we need to increase the width.
			var tester = $("<div>").css({ position: "absolute", top: "-1000px", left: "-1000px", "font-size": "11px", "font-family": "Helvetica", "white-space": "nowrap" });
			$("body").append(tester);
			tester.html(text);
			var width = tester.width();
			
			var span = Container.find("span");
	
			// If we're in a section cell we may need to be smaller.
			if (Element.parent().get(0).tagName.toLowerCase() == "section") {
				var sectionwidth = Element.parent().width();
				if (sectionwidth < (width + 56)) {
					width = sectionwidth - 80;
					span.css({ overflow: "hidden", padding: "0 0 0 10px" });
				}
			}
	
			if (width > span.width()) {
				span.css({ width: (width + 10) + "px" });
				Container.find(".select_options").css({ width: (width + 64) + "px" });
			}
	
			tester.remove();
		};
		
		function blur() {
			Container.removeClass("focused");
		};
	
		function click() {
			if (Container.hasClass("disabled")) {
				return false;
			}
	
			if (!Open) {
				// Tooltips and menus sometimes show over the dropdown when using TinyMCE 4
				try {
					tinyMCE.ui.FloatPanel.hideAll();
				} catch (err) {}
			
				$("select").not(Element).trigger("closeNow");
				Element.focus();
				
				// Check if we're in a sortable row and disable it's relative position if so.
				var li = Element.parent("li");
				if (li.length) {
					if (li.css("position") == "relative") {
						li.css("position","");
						WasRelative = true;
					}
				}
				
				var select_options = Container.find(".select_options").show();
				Open = true;
				Container.addClass("open");
				$("body").click(close);
				
				// Find out if we're in a dialog and have an overflow
				var overflow = Container.parents(".overflow");
				if (overflow.length) {
					if (Container.parents("#callout_resources").length) {
						// WebKit needs fixin.
						if ($.browser.webkit) {
							select_options.css("marginTop",-1 * $("#callout_resources").scrollTop() + "px");
						}
						// When someone scrolls the overflow, close the select or the dropdown will detach.
						setTimeout(function() { $("#callout_resources").scroll(close); },500);
					} else {
						// WebKit needs fixin.
						if ($.browser.webkit) {
							select_options.css("marginTop",-1 * overflow.scrollTop() + "px");
						}
						// When someone scrolls the overflow, close the select or the dropdown will detach.
						setTimeout(function() { overflow.scroll(close); },500);
					}		
				} else {
					// If the select drops below the visible area, scroll down a bit.
					var toScroll = (select_options.offset().top + select_options.height()) - window.scrollY - $(window).height();
					if (toScroll > 0) {
						$('html, body').animate({ scrollTop: window.scrollY + toScroll + 5 }, 200);
					}
				}
			} else {
				close();
			}
	
			return false;
		};

		function close() {
			Open = false;
			Container.removeClass("open").find(".select_options").hide();
			// Remove events for closing the dropdown
			$("body").unbind("click",close);
			$("#callout_resources").unbind("scroll",close);
			Container.parents(".overflow").unbind("scroll",close);
			
			// Reset relative position if applicable
			if (WasRelative) {
				Element.parent("li").css("position", "relative");
				WasRelative = false;
			}
			
			return false;
		};
	
		function disable() {
			Element.attr("disabled","disabled");
			Container.addClass("disabled");
		};
	
		function enable() {
			Element.removeAttr("disabled");
			Container.removeClass("disabled");
		};
	
		function focus() {
			Container.addClass("focused");
		};
		
		function keydown(ev) {
			// If a modifier has been pressed, ignore this.
			if (ev.ctrlKey || ev.altKey || ev.metaKey) {
				return true;
			}
	
			if (ev.keyCode == 13 && Open) {
				close();
				return false;
			}
	
			// The original select element that's hidden off screen.
			var el = Element.get(0);
			
			// Get the original index and save it so we know when it changes.
			var index = el.selectedIndex;
			var originalIndex = index;
			
			// Up or left arrow pressed
			if (ev.keyCode == 38 || ev.keyCode == 37) {
				index--;
				if (index < 0) {
					index = 0;
				}
			// Down or right arrow pressed
			} else if (ev.keyCode == 40 || ev.keyCode == 39) {
				index++;
				if (index == el.options.length) {
					index--;
				}
			// A letter key was pressed
			} else if (ev.keyCode > 64 && ev.keyCode < 91) {
				var spot = ev.keyCode - 65;
				var letters = "abcdefghijklmnopqrstuvwxyz";
				var letter = letters[spot];
				
				// Go through all the options in the select to see if any of them start with the letter that was pressed.
				for (var i = index + 1; i < el.options.length; i++) {
					var text = el.options[i].text;
					if (text) {
						var first_letter = text[0].toLowerCase();
						if (first_letter == letter) {
							index = i;
							break;
						}
					}
				}
				
				// If we were already on that letter, find the next one with that same letter.
				if (index == originalIndex) {
					for (var i = 0; i < originalIndex; i++) {
						var text = el.options[i].text;
						if (text) {
							var first_letter = text[0].toLowerCase();
							if (first_letter == letter) {
								index = i;
								break;
							}
						}
					}
				}
			}
			
			// We found a new element, fire an event saying the select changed and update the description in the styled dropdown.
			if (index != originalIndex) {
				// Update the new selected option
				var select_options_container = Container.find(".select_options");
				var ops = select_options_container.find("a");
				ops.eq(originalIndex).removeClass("active");
				ops.eq(index).addClass("active");
	
				// Find out if we can see this option
				var selected_y = (index + 1) * 25;
				if (selected_y >= select_options_container.height() + select_options_container.scrollTop()) {
					select_options_container.animate({ scrollTop: selected_y - select_options_container.height() + "px" }, 250);
				} else if (selected_y <= select_options_container.scrollTop()) {
					select_options_container.animate({ scrollTop: selected_y - 25 + "px" }, 250);
				}
		
				// Firefox wants to handle this change itself, so we'll give it a shot until they fix their browser engine.
				if ($.browser.mozilla && ev.keyCode > 36 && ev.keyCode < 41) {
				} else {
					el.selectedIndex = index;
				}
	
				Container.find("span").html('<figure class="handle"></figure>' + el.options[index].text);
				Element.trigger("change", { value: el.options[index].value, text: el.options[index].text });
				
				return false;
			}
			
			// Stop the event if it's not a tab.
			if (ev.keyCode != 9) {
				return false;
			}
		};
	
		function remove(value) {
			// Remove it from the actual select.
			var ops = Element.find("option");
			for (var i = 0; i < ops.length; i++) {
				if (ops.eq(i).val() == value) {
					ops.eq(i).remove();
				}
			}
			// Remove it from the styled one.
			var as = Container.find(".select_options a");
			for (var i = 0; i < as.length; i++) {
				if (as.eq(i).attr("data-value") == value) {
					var text_was = as.eq(i).html();
					as.eq(i).remove();
				}
			}
			// If the current selected state is the value we're removing, switch to the first available.
			var sel = Container.find("span").eq(0);
			var select_options = Container.find(".select_options a");
			if (select_options.length > 0) {
				if (sel.html() == '<figure class="handle"></figure>' + text_was) {
					sel.html('<figure class="handle"></figure>' + select_options.eq(0).html());
				}
			} else {
				sel.html('<figure class="handle"></figure>');
			}
		};
		
		function select(event) {
			var el = $(event.target);
			// Set the <select> to the new value
			Element.val(el.attr("data-value"));
			// Update the selected state of the custom dropdown
			Container.find("span").html('<figure class="handle"></figure>' + el.html());
			Container.find("a").removeClass("active");
			el.addClass("active");
			// Close the dropdown
			close();
			// Tell the <select> it has changed.
			Element.trigger("change", { value: el.attr("data-value"), text: el.innerHTML });
			return false;
		};

		// Init routine
		if (Element.hasClass("custom_control")) {
			return false;
		}
		Element.addClass("custom_control");
		
		// WebKit likes to freak out when we focus a position: absolute <select> in an overflow: scroll area
		if ($.browser.webkit) {
			Element.css({ position: "relative", left: "-1000000px", float: "left", width: "1px", marginRight: "-1px" });
		} else {
			Element.css({ position: "absolute", left: "-1000000px" });
		}

		var tester = $("<div>").css({ position: "absolute", top: "-1000px", left: "-1000px", "font-size": "11px", "font-family": "Helvetica", "white-space": "nowrap" });
		$("body").append(tester);
		var maxwidth = 0;
		
		var html = "";
		var selected = "";
		var selected_option = "";
		
		// Need to find all children since we have to account for options in and out of optgroups
		var first_level = Element.children();
		var y = 0;
		for (var i = 0; i < first_level.length; i++) {
			var el = first_level.get(i);
			if (el.nodeName.toLowerCase() == "optgroup") {
				var l = $(el).attr("label");
				html += '<div class="group">' + l + '</div>';
				// Get the size of this text.
				tester.html(l);
				var width = tester.width();
				if (width > maxwidth) {
					maxwidth = width;
				}
				
				var options = $(el).find("option");
				for (x = 0; x < options.length; x++) {
					y++;
					var option = options.eq(x);
					var text = option.html();
					var val = option.attr("value");
					if (!val) {
						val = text;
					}
					
					// Get the size of this text.
					tester.html(text);
					width = tester.width();
					if (width + 20 > maxwidth) {
						maxwidth = width + 20;
					}
					
					if (y == 1) {
						selected_option = text;
					}
					
					if (option.attr("selected")) {
						html += '<a class="optgroup active" href="#" data-value="' + val + '">' + text + '</a>';		
						selected_option = text;
					} else {
						html += '<a class="optgroup" href="#" data-value="' + val + '">' + text + '</a>';
					}
				}
			} else {
				y++;
				var option = $(el);
				var text = option.html();
				var val = option.attr("value");
				if (!val) {
					val = text;
				}
				
				// If we're making a tree-like dropdown
				if (option.attr("data-depth")) {
					var depth = parseInt(option.attr("data-depth")) * 10;
				} else {
					var depth = 0;
				}

				// Get the size of this text.
				tester.html(text);
				var width = tester.width() + depth;
				if (width > maxwidth) {
					maxwidth = width;
				}
				
				if (y == 1) {
					selected_option = text;
				}
				
				if (option.attr("selected")) {
					html += '<a style="border-left: ' + depth + 'px solid #CCC;" class="active" href="#" data-value="' + val + '">' + text + '</a>';		
					selected_option = text;
				} else {
					html += '<a style="border-left: ' + depth + 'px solid #CCC;" href="#" data-value="' + val + '">' + text + '</a>';
				}
			}
		}
		
		Container.html('<span><figure class="handle"></figure>' + selected_option + '</span><div class="select_options" style="display: none;">' + html + '</div>');

		var spanwidth = maxwidth;
		// If we're in a section cell we may need to be smaller.
		if (Element.parent().get(0).tagName.toLowerCase() == "section") {
			var sectionwidth = $(element).parent().width();
			if (sectionwidth < (maxwidth + 56)) {
				spanwidth = sectionwidth - 80;
				Container.find("span").css({ overflow: "hidden", padding: "0 0 0 10px" });
			}
		}
		
		Container.find("span").css({ width: (spanwidth + 10) + "px", height: "30px" }).html('<figure class="handle"></figure>' + selected_option).click(click);
		Container.find(".select_options").css({ width: (maxwidth + 64) + "px" });
		Container.on("click","a",select);
		Container.find(".handle").click(click);
		
		// Add it to the DOM
		Element.after(Container);		

		// See if this select is disabled
		if (Element.attr("disabled")) {
			Container.addClass("disabled");
		}
		
		// Observe focus, blur, and keydown on the hidden element.
		Element.focus(focus).blur(blur).keydown(keydown);
		// Custom event to force open lists closed when another select opens.
		Element.on("closeNow",close);

		// Cleanup
		tester.remove();

		return { Container: Container, Element: Element, add: add, blur: blur, click: click, close: close, disable: disable, enable: enable, focus: focus, remove: remove };

	})(jQuery,element);
};

var BigTreeFileInput = function(element) {
	return (function($,element) {

		var Container =  $("<div>").addClass("file_wrapper").html('<span class="handle">Upload</span><span class="data"></span>');
		var Element = $(element);

		function checkUploads() {
			// Max file size
			var max_size = parseInt($("#bigtree_max_file_size").val());
	
			// No content or early browser fallback? Just draw the input's value
			if (!Element.get(0).files.length) {
				Container.find(".data").html('<span class="name wider">' + Element.get(0).value + '	</span>');
			} else {
				// If this input allows for multiple uploads we're not going to handle it directly, watch its change event yourself
				if (Element.attr("multiple") && Element.get(0).files.length > 1) {
					Container.find(".data").html('<span class="name">' + Element.get(0).files.length + ' Files</span>');
				// Single upload? Show the thumbnail and file name / size
				} else {
					// Get file reference
					var file = Element.get(0).files[0];
	
					// See if the file is too big
					if (max_size && max_size < file.size) {
						// Clear it out
						Container.find(".data").html('<span class="size">' + formatBytes(file.size) + '</span><span class="name error wider">File Too Large (Max ' + formatBytes(max_size) + ')</span>');
						Element.val("");
					// File size is ok
					} else {
						Container.find(".data").html('<span class="size">' + formatBytes(file.size) + '</span><span class="name">' + file.name + '</span>');
						// If this is an image, draw a thumbnail
						if (file.type == "image/jpeg" || file.type == "image/png" || file.type == "image/gif") {
							var img = document.createElement("img");
							img.file = file;
							Container.find(".data").prepend(img);
							var reader = new FileReader();
							reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
							reader.readAsDataURL(file);
						// Not an image? Give more room for the file name
						} else {
							Container.find(".name").addClass("wider");
						}
					}
				}
			}
		};

		function clear() {
			Element.val("");
			checkUploads();
		};
	
		function connect(el) {
			Element = $(el).on("change",checkUploads);
			return { Container: Container, Element: Element, clear: clear, connect: connect };
		};
	
		// Courtesy of Aliceljm on StackOverflow
		function formatBytes(bytes) {
			var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
			var i = Math.floor(Math.log(bytes) / Math.log(1000));
			return (bytes / Math.pow(1000, i)).toPrecision(3) + sizes[i];
		};	

		// Init routine
		if (Element.hasClass("custom_control")) {
			return false;
		}
		Container.find(".handle").click(function() { Element.click(); });
		Element.addClass("custom_control").hide().on("change",checkUploads).before(Container);
		
		return { Container: Container, Element: Element, clear: clear, connect: connect };

	})(jQuery,element);
};

var BigTreeRadioButton = function(element) {
	return (function($,element) {

		var Element = $(element);
		var Link = false;

		function focus() {
			Link.addClass("focused");
		};

		function blur() {
			Link.removeClass("focused");
		};
	
		function keydown(ev) {
			if (ev.keyCode == 32) {
				click(ev);
				return false;
			}
			if (ev.keyCode == 39 || ev.keyCode == 40) {
				next(ev);
				return false;
			}
			if (ev.keyCode == 37 || ev.keyCode == 38) {
				previous(ev);
				return false;
			}
		};

		function clear(ev) {
			$('input[name="' + Element.attr("name") + '"]').each(function() {
				this.customControl.Link.removeClass("checked");
				$(this).removeAttr("checked");
				$(this).trigger("change");
			});
		};

		function click(ev) {
			if (Link.hasClass("checked")) {
				// If it's already clicked, nothing happens for radio buttons.
			} else {
				Link.addClass("checked");
				Element.attr("checked",true);
				$('input[name="' + Element.attr("name") + '"]').not(Element).each(function() {
					this.customControl.Link.removeClass("checked");
					$(this).trigger("change");
				});
			}
			Element.triggerHandler("click");
			Element.triggerHandler("change");
			return false;
		};
	
		function next(ev) {
			var all = $('input[name="' + Element.attr("name") + '"]');
			var index = all.index(Element);
			if (index != all.length - 1) {
				all[index + 1].customControl.Link.focus();
				all[index + 1].customControl.click(ev);
			}
		};
		
		function previous(ev) {
			var all = $('input[name="' + Element.attr("name") + '"]');
			var index = all.index(Element);
			if (index != 0) {
				all[index - 1].customControl.Link.focus();
				all[index - 1].customControl.click(ev);
			}
		};

		// Init routine
		if (Element.hasClass("custom_control")) {
			return false;
		}
		
		// Have label clicks affect the checkbox but let links inside of the labels still work properly
		Element.addClass("custom_control")
			   .next("label").click(click)
			   .find("a").click(function(ev) { ev.stopPropagation(); });

		Link = $("<a>").attr("href","#radio").click(click).focus(focus).blur(blur).keydown(keydown);
		
		if (element.checked) {
			Link.addClass("checked");
		}
		
		if (element.disabled) {
			Link.addClass("disabled")
				.attr("tabindex","-1");
		} else if (element.tabIndex) {
			Link.attr("tabindex",element.tabIndex);
		}
		
		Element.hide().after($('<div class="radio_button">').append(Link));

		return { Element: Element, Link: Link, blur: blur, click: click, clear: clear, focus: focus };

	})(jQuery,element);
};

var BigTreePhotoGallery = function(settings) {
	return (function($,settings) {

		var ActiveCaption = false;
		var Container = false;
		var Counter = 0;
		var DisableCaptions = false;
		var FileInput = false;
		var Key = false;

		function addPhoto() {
			if (!FileInput.val()) {
				return false;
			}
			if (!DisableCaptions) {
				new BigTreeDialog({
					title: "Image Caption",
					content: '<fieldset><label>Caption</label><input type="text" name="caption" /></fieldset>',
					callback: saveNewFile,
					icon: "caption"
				});
			} else {
				saveNewFile({ caption: "" });
			}
			return false;
		};
		
		function deletePhoto() {
			new BigTreeDialog({
				title: "Remove Photo",
				content: '<p class="confirm">Are you sure you want to remove this photo?</p>',
				icon: "delete",
				alternateSaveText: "OK",
				callback: $.proxy(function() { $(this).parents("li").remove(); },this)
			});
			
			return false;
		};
		
		function editPhoto(ev) {
			var link = $(ev.target);
			ActiveCaption = link.siblings(".caption");
	
			new BigTreeDialog({
				title: "Image Caption",
				content: '<fieldset><label>Caption</label><input type="text" name="caption" value="' + htmlspecialchars(ActiveCaption.val()) + '"/></fieldset>',
				callback: saveCaption,
				icon: "caption"
			});
	
			return false;
		};

		function openFileManager(ev) {
			var target = $(ev.target);
			// In case they click the span instead of the button.
			if (!target.attr("href")) {
				var field = target.parent().attr("href").substr(1);	
				var options = $.parseJSON(target.parent().attr("data-options"));
			} else {
				var field = target.attr("href").substr(1);
				var options = $.parseJSON(target.attr("data-options"));
			}
			BigTreeFileManager.formOpen("photo-gallery",field,options,useExistingFile);
			return false;
		};

		function saveCaption(data) {
			ActiveCaption.val(data.caption);
			ActiveCaption = false;
		};
		
		function saveNewFile(data) {
			var li = $('<li>').html('<figure></figure><a href="#" class="icon_delete"></a>');
			if (!DisableCaptions) {
				li.find("a").before('<a href="#" class="icon_edit"></a>');
			}
	
			// Try to get an image preview but fallback to the old upload message
			var img = FileInput.prev(".file_wrapper").find("img");
			if (img.length) {
				li.find("figure").append(img);
			} else {
				li.find("figure").append('<figcaption>Awaiting Upload</figcaption>');
			}
	
			// Move the hidden input into an image box for upload
			li.append(FileInput.hide());
			li.append($('<input type="hidden" name="' + Key + '[' + Counter + '][caption]" class="caption" />').val(data.caption));
			Container.find("ul").append(li);
	
			// Increment the photo counter
			Counter++;
			
			// Create a new hidden file input for the next image to be uploaded
			var new_file = $('<input type="file" class="custom_control" name="' + Key + '[' + Counter + '][image]">').hide();
			Container.find(".file_wrapper").after(new_file);
			
			// Wipe existing custom control information, assign the new input to it
			var customControl = FileInput.get(0).customControl;
			customControl.Container.find(".data").html("");
			new_file.get(0).customControl = customControl.connect(new_file.get(0));
			FileInput.get(0).customControl = false;
			FileInput = new_file;
		};
		
		function useExistingFile(path,caption,thumbnail) {
			var li = $('<li>').html('<figure><img src="' + thumbnail + '" alt="" /></figure><a href="#" class="icon_edit"></a><a href="#" class="icon_delete"></a>');
			li.append($('<input type="hidden" name="' + Key + '[' + Counter + '][existing]" />').val(path));
			li.append($('<input type="hidden" name="' + Key + '[' + Counter + '][caption]" class="caption" />').val(caption));
			Container.find("ul").append(li);
			Counter++;
		};

		// Init routine
		var Defaults = {
			"container": "",
			"key": "",
			"counter": 0,
			"disableCaptions": ""
		};

		// BigTree 4.2 behavior should be to pass in a settings object
		if (is_object(settings)) {
			for (var i in settings) {
				Defaults[i] = settings[i];
			}
		// Allow for backwards copatibility with BigTree <= 4.1
		} else {
			Defaults.container = arguments[0];
			Defaults.key = arguments[1];
			Defaults.counter = arguments[2];
			Defaults.disableCaptions = arguments[3];
		}

		Key = Defaults.key;
		Container = $("#" + Defaults.container.replace("#",""));
		Counter = Defaults.counter;
		DisableCaptions = Defaults.disableCaptions;
		FileInput = Container.find("footer input");
		
		Container.on("click",".icon_delete",deletePhoto)
				 .on("click",".icon_edit",editPhoto)
				 .on("change","input[type=file]",addPhoto);
		Container.find(".form_image_browser").click(openFileManager);
		Container.find("ul").sortable({ items: "li", placeholder: "ui-sortable-placeholder" });

		return { ActiveCaption: ActiveCaption, Container: Container, Counter: Counter, DisableCaptions: DisableCaptions, FileInput: FileInput, Key: Key, addPhoto: addPhoto, openFileManager: openFileManager, useExistingFile: useExistingFile };

	})(jQuery,settings);
};

// !BigTree Tag Adder Object
var BigTreeTagAdder = (function($) {
	
	var Dropdown = false;
	var LastSearch = false;
	var Searching = false;
	var SelectedTag = -1;
	var TagEntry = false;
	var TagList = false;
	var TagResults = false;
	
	function init() {
		TagEntry = $("#tag_entry").keydown(checkKeys).keyup(searchTags);
		TagList = $("#tag_list").on("click","a",deleteHook);
		TagResults = $("#tag_results");
	};
	
	function checkKeys(ev) {
		if (ev.keyCode == 13) {
			if (SelectedTag > -1 && Dropdown) {
				var v = TagResults.find("li").eq(SelectedTag).find("a").html().replace("<span>","").replace("</span>","");
				TagEntry.val(v);
			}
			addTag(ev);
			return false;
		}
		if (ev.keyCode == 38) {
			moveUp(ev);
			return false;
		}
		if (ev.keyCode == 40) {
			moveDown(ev);
			return false;
		}
	};
	
	function moveUp(ev) {
		if (!Dropdown || SelectedTag < 0) {
			return;
		}
		var li = TagResults.find("li");
		li.eq(SelectedTag).removeClass("selected");
		SelectedTag--;
		if (SelectedTag > -1) {
			li.eq(SelectedTag).addClass("selected");
		}
	};
	
	function moveDown(ev) {
		var li = TagResults.find("li");
		var max = li.length - 1;
		if (!Dropdown || SelectedTag == max) {
			return;
		}
		if (SelectedTag > -1) {
			li.eq(SelectedTag).removeClass("selected");
		}
		SelectedTag++;
		li.eq(SelectedTag).addClass("selected");
	};
	
	function searchTags(ev) {
		var tag = TagEntry.val();
		if (tag != LastSearch) {
			LastSearch = tag;
			if (tag.length > 3) {
				TagResults.load("admin_root/ajax/tags/search/", { tag: tag }, hookResults);
			} else {
				TagResults.hide();
			}
		}
	};
	
	function hookResults() {
		SelectedTag = -1;
		if (TagResults.html()) {
			TagResults.show();
			Dropdown = true;
			TagResults.find("li a").click(chooseTag);
		} else {
			Dropdown = false;
			TagResults.hide();
		}
	};
	
	function deleteHook(ev) {
		$(this).parents("li").remove();
		return false;
	};
	
	function chooseTag(ev) {
		var el = ev.target;
		var tag = el.innerHTML.replace("<span>","").replace("</span>","");
		if (tag) {
			ActiveTagName = tag;
			$.ajax("admin_root/ajax/tags/create-tag/", { type: "POST", data: { tag: tag }, success: addedTag });
		}
		return false;
	};
	
	function addTag(ev) {
		var tag = TagEntry.val();
		if (tag) {
			ActiveTagName = tag;
			$.ajax("admin_root/ajax/tags/create-tag/", { type: "POST", data: { tag: tag }, success: addedTag });
		}
	};
	
	function addedTag(id) {
		TagList.append($('<li class="tag">').html('<a href="#"><input type="hidden" name="_tags[]" value="' + id + '" />' + ActiveTagName + '<span>x</span></a>'));
		TagEntry.val("").focus();
		TagResults.hide();
		Dropdown = false;
	};

	return { init: init };
})(jQuery);

var BigTreeDialog = function(settings) {
	return (function($,settings) {

		var DialogHeight;
		var DialogWidth;
		var HeightWatchTimer;
		var DialogWindow;
		var OnComplete = false;
		var OnCancel = false;

		function checkForEsc(e) {
			if (e.keyCode == 27) {
				dialogClose();
			}
		};
	
		function dialogClose() {
			// Call the cancel hook once, if it requests that we close the dialog, don't run it again.
			if (OnCancel) {
				OnCancel();
				OnCancel = false;
			} else {
				$(".bigtree_dialog_overlay").last().remove();
				$(".bigtree_dialog_window").last().remove();
				$("body").off("keyup",checkForEsc);
				BigTree.zIndex -= 2;
			}
			return false;
		};
	
		function dialogSubmit(ev) {
			ev.preventDefault();
			ev.stopPropagation();
	
			// Let's move all the TinyMCE content back.
			if (typeof tinyMCE != "undefined") {
				DialogWindow.find("textarea:hidden").each(function() {
					var id = $(this).attr("id");
					$(this).val(tinyMCE.get(id).getContent());
				});
			}
	
			// Pass the form data to our callback as JSON
			OnComplete(BigTree.CleanObject(DialogWindow.find(".bigtree_dialog_form").serializeJSON()));
			
			// Remove the dialog
			$(".bigtree_dialog_overlay").last().remove();
			$(".bigtree_dialog_window").last().remove();
			$("body").off("keyup",checkForEsc);
		};

		function watchHeight() {
			var height = DialogWindow.height();
			if (height != DialogHeight) {
				DialogHeight = height;
				windowResize(false,true);
			}
		};

		function windowResize(ev,animate) {
			var left_offset = parseInt((BigTree.WindowWidth() - DialogWidth) / 2);
			var top_offset = parseInt((BigTree.WindowHeight() - DialogHeight) / 2);
			
			if (animate) {
				DialogWindow.animate({ "top": top_offset + "px", "left": left_offset + "px" }, 200);
			} else {
				DialogWindow.css({ "top": top_offset + "px", "left": left_offset + "px" });
			}
		};

		// Init routine
		var Defaults = {
			alternateSaveText: false,
			callback: false,
			cancelHook: false,
			content: "",
			icon: false,
			noFooter: false,
			preSubmissionCallback: false,
			title: "",
			width: 450,
			height: 400
		};
	
		// BigTree 4.2 behavior should be to pass in a settings object
		if (is_object(settings)) {
			for (var i in settings) {
				Defaults[i] = settings[i];
			}
		// Allow for backwards copatibility with BigTree <= 4.1
		} else {
			Defaults.title = arguments[0];
			Defaults.content = arguments[1];
			Defaults.callback = arguments[2];
			Defaults.icon = arguments[3];
			Defaults.noFooter = arguments[4];
			Defaults.alternateSaveText = arguments[5];
			Defaults.preSubmissionCallback = arguments[6];
			Defaults.cancelHook = arguments[7];
		}

		// Setup a callback to give the data to once they submit their dialog
		OnComplete = Defaults.callback;
		OnCancel = Defaults.cancelHook;

		// If they hit escape, close the dialog
		$("body").on("keyup",checkForEsc);

		// Build our window
		var overlay = $('<div class="bigtree_dialog_overlay" style="z-index: ' + (BigTree.zIndex++) + ';">');
		DialogWindow = $('<div class="bigtree_dialog_window">').css({ zIndex: BigTree.zIndex++ });
		$("body").append(overlay).append(DialogWindow);

		// Fill the window
		var html = '<h2>';
		if (Defaults.icon) {
			html += '<span class="icon_dialog_' + Defaults.icon + '"></span>';
		}
		html += Defaults.title + '</h2><form class="bigtree_dialog_form" method="post" enctype="multipart/form-data" action="" class="module"><div class="overflow">' +  Defaults.content + '</div>';
		if (!Defaults.noFooter) {
			var saveText = Defaults.alternateSaveText ? Defaults.alternateSaveText : "Save";
			html += '<footer><a class="button bigtree_dialog_close">Cancel</a><input type="submit" class="button blue" value="' + saveText + '" /></footer>';
		}
		html += '</form>';
		DialogWindow.html(html);
		BigTreeCustomControls(DialogWindow);

		DialogWidth = DialogWindow.width();
		DialogHeight = DialogWindow.height();
		DialogWindow.css({ left: parseInt((BigTree.WindowWidth() - DialogWidth) / 2) + "px", top: parseInt((BigTree.WindowHeight() - DialogHeight) / 2) + "px" });
		console.log(DialogWindow);

		BigTree.FormHooks(DialogWindow);
				
		// Hook cancel button
		DialogWindow.find(".bigtree_dialog_close").click(dialogClose);
		
		// Hook form submission, if they don't want the submission just call the complete callback
		if (Defaults.preSubmissionCallback) {
			DialogWindow.find(".bigtree_dialog_form").submit(OnComplete);
		} else {
			DialogWindow.find(".bigtree_dialog_form").submit(dialogSubmit);
		}
		
		// For confirmation dialogs, enter should immediately close
		DialogWindow.find("input[type=submit]").focus();
		
		// Handle moving the dialog around if the window changes
		$(window).resize(windowResize);
		
		// Set a timer to watch for a change in the dialog height to recenter.
		HeightWatchTimer = setInterval(watchHeight,250);

	})(jQuery,settings);
};

var BigTreeFileManager = (function($) {

	// Properties

	var AvailableThumbs = false;
	var Browser = false;
	var Callback = false;
	var CurrentFolder = 0;
	var CurrentlyKey = false;
	var CurrentlyName = false;
	var FieldName = false;
	var MinHeight = false;
	var MinWidth = false;
	var StartSearchTimer = false;
	var TitleSaveTimer = false;
	var Type = false;
	
	// Methods
	
	function addFile() {
		new BigTreeDialog({
			title: "Upload Files",
			content: '<input type="hidden" name="folder" value="' + CurrentFolder + '" /><fieldset><label>Select File(s)</label><input type="file" multiple name="files[]" /></fieldset>',
			icon: "folder",
			alternateSaveText: "Upload Files",
			preSubmissionCallback: true,
			callback: createFile,
			cancelHook: cancelAdd
		});
		return false;
	};
	
	function addFolder() {
		new BigTreeDialog({
			title: "New Folder",
			content: '<input type="hidden" name="folder" value="' + CurrentFolder + '" /><fieldset><label>Folder Name</label><input type="text" name="name" /></fieldset>',
			callback: createFolder,
			icon: "folder",
			alternateSaveText: "Create Folder",
			preSubmissionCallback: true,
			cancelHook: cancelAdd
		});
		
		return false;
	};
	
	function cancelAdd() {
		$(".bigtree_dialog_overlay").last().remove();
		$(".bigtree_dialog_window").last().remove();
		BigTree.zIndex -= 2;
		
		return false;
	};
	
	function chooseImageSize() {
		$("#file_browser_upload").unbind("click").html("").css({ cursor: "default" }).click(function() { return false; });
		$("#file_browser_form .footer input.blue").hide();
		$("#file_browser_info_pane").css({ height: "437px", marginTop: 0, marginLeft: "-1px" });

		var size_pane = $("#file_browser_size_pane").html('<h3>Select Image Size</h3><p>Click on an image size below to insert into your content.</p>');
		// Add all available thumbnail sizes as buttons
		for (var i = 0; i < AvailableThumbs.length; i++) {
			var size = AvailableThumbs[i];
			var link = $('<a class="button">').attr("href",size.file.replace("{wwwroot}", "www_root/").replace("{staticroot}","static_root/")).html(size.name);
			size_pane.append(link);
		}
		// Add original size button and move the size pane to the left
		size_pane.append($('<a class="button">').attr("href",$("#file_browser_selected_file").val().replace("{wwwroot}", "www_root/").replace("{staticroot}","static_root/")).html("Original"));
		size_pane.css({ marginLeft: "210px" });

		// Hook the size buttons to change the selected URL
		size_pane.find("a").click(function() {
			FieldName.value = $(this).attr("href");
			closeFileBrowser();
			return false;
		});

		return false;
	};
	
	function closeFileBrowser() {
		$(".bigtree_dialog_overlay").last().remove();
		$("#file_browser").remove();
		BigTree.zIndex = BigTree.zIndexBackup;
		$("#mceModalBlocker, #mce-modal-block").show();
		
		return false;
	};
	
	function createFile() {
		var last_dialog = $(".bigtree_dialog_form").last();

		$("body").append($('<iframe name="file_manager_upload_frame" style="display: none;" id="file_manager_upload_frame">'));
		last_dialog.attr("action","admin_root/ajax/file-browser/upload/")
					.attr("target","file_manager_upload_frame");
		last_dialog.find("footer *").hide();
		last_dialog.find("footer").append($('<p style="line-height: 16px; color: #333;"><img src="admin_root/images/spinner.gif" alt="" style="float: left; margin: 0 5px 0 0;" /> Uploading files. Please wait…</p>'));
	};
	
	function createFolder(data) {
		var last_dialog = $(".bigtree_dialog_form").last();

		$("body").append($('<iframe name="file_manager_upload_frame" style="display: none;" id="file_manager_upload_frame">'));
		last_dialog.attr("action","admin_root/ajax/file-browser/create-folder/")
					.attr("target","file_manager_upload_frame");
		last_dialog.find("footer *").hide();
		last_dialog.find("footer").append($('<p style="line-height: 16px; color: #333;"><img src="admin_root/images/spinner.gif" alt="" style="float: left; margin: 0 5px 0 0;" /> Creating folder. Please wait…</p>'));
	};

	function deleteFile(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		var count = parseInt($(this).attr("data-allocation"));
		if (count) {
			var c = confirm("This file is in use in " + count + " locations.\nThese links or images will become empty or broken.\n\nAre you sure you want to delete this file?");
		} else {
			var c = confirm("Are you sure you want to delete this file?");
		}
		if (c) {
			$.ajax("admin_root/ajax/file-browser/delete/", { type: "POST", data: { file: $("#file_browser_selected_file").val() } });
			$("#file_browser_contents .selected").remove();
			$("#file_browser_info_pane").html("");
			$("#file_browser .footer .blue").hide();
		}
	};

	function deleteFolder(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		$.ajax("admin_root/ajax/file-browser/folder-allocation/", { type: "POST", data: { folder: CurrentFolder }, complete: function(r) {
			var j = $.parseJSON(r.responseText);
			if (confirm("This folder has " + j.folders + " sub-folder(s) and " + j.resources + " file(s) which will be deleted.\n\nFiles in this folder are in use in " + j.allocations + " location(s).\n\nAre you sure you want to delete this folder?")) {
				$.ajax("admin_root/ajax/file-browser/delete-folder/", { type: "POST", data: { folder: CurrentFolder }, complete: function(r) {
					if (Type == "image" || Type == "photo-gallery") {
						openImageFolder(r.responseText);	
					} else {
						openFileFolder(r.responseText);
					}
				}});
			}
		}});
	};
	
	function disableCreate() {
		$("#file_browser .header a").hide();		
	};
	
	function enableCreate() {
		$("#file_browser .header a").show();
	};
	
	function fileBrowser() {
		$("#file_browser_type_icon").addClass("icon_folder");
		$("#file_browser_type .title").html("File Browser");
		openFileFolder(0);
	};
	
	function fileBrowserPopulated() {
		$("#file_browser_contents a").click(fileClick);
	};
	
	function fileClick() {				
		if ($(this).hasClass("disabled")) {
			return false;
		}
		
		if ($(this).hasClass("folder")) {
			$("#file_browser .footer .blue").hide();
			openFileFolder($(this).attr("href").substr(1));
			return false;
		}

		// Show the "Use" button now that something is selected.
		$("#file_browser .footer .blue").show();
		
		$("#file_browser_contents a").removeClass("selected");
		$(this).addClass("selected");
		$("#file_browser_selected_file").val($(this).attr("href").replace("{wwwroot}","www_root/").replace("{staticroot}","static_root/"));
		$("#file_browser_info_pane").html('<span class="spinner"></span>');
		$("#file_browser_info_pane").load("admin_root/ajax/file-browser/file-info/",
			{ file: $(this).attr("href") },
			function() {
				$("#file_browser_detail_title_input").keyup(function() {
					clearTimeout(TitleSaveTimer);
					TitleSaveTimer = setTimeout(saveFileTitle,500);
				});
				$("#file_browser_info_pane .replace").click(replaceFile);
				$("#file_browser_info_pane .delete").click(deleteFile);
			}
		);
		
		return false;
	};
	
	function finishedUpload(errors) {
		$(".bigtree_dialog_overlay").last().remove();
		$(".bigtree_dialog_window").last().remove();
		$("#file_manager_upload_frame").remove();
		BigTree.zIndex -= 3;
		
		if (Type == "image" || Type == "photo-gallery") {
			openImageFolder(CurrentFolder);	
		} else {
			openFileFolder(CurrentFolder);
		}
	};
	
	function formOpen(type,field_name,options,callback) {
		CurrentlyName = field_name;
		CurrentlyKey = options.currentlyKey;
		// We set this because fieldName is used by the TinyMCE hook, I know the naming doesn't make sense.
		FieldName = false;
		Callback = callback;
		open(type,options.minWidth,options.minHeight);
	};

	function hideDeleteFolder() {
		$("#file_browser .delete_folder").hide();
	};
	
	function imageBrowser() {
		$("#file_browser_type_icon").addClass("icon_images");
		$("#file_browser_type .title").html("Image Library");
		openImageFolder(0);
	};
	
	function imageBrowserPopulated() {
		$("#file_browser_contents a").click(imageClick);
	};
	
	function imageClick() {
		if ($(this).hasClass("disabled")) {
			return false;
		}
		
		if ($(this).hasClass("folder")) {
			$("#file_browser .footer .blue").hide();
			openImageFolder($(this).attr("href").substr(1));
			return false;
		}

		// Show the "Use" button now that something is selected.
		$("#file_browser .footer .blue").show();

		
		$("#file_browser_contents a").removeClass("selected");
		$(this).addClass("selected");
		
		data = $.parseJSON($(this).attr("href"));
		AvailableThumbs = data.thumbs;
		$("#file_browser_selected_file").val(data.file.replace("{wwwroot}","www_root/").replace("{staticroot}","static_root/"));
		
		$("#file_browser_info_pane").html('<span class="spinner"></span>');
		$("#file_browser_info_pane").load("admin_root/ajax/file-browser/file-info/",
			{ file: data.file },
			function() {
				$("#file_browser_detail_title_input").keyup(function() {
					clearTimeout(TitleSaveTimer);
					TitleSaveTimer = setTimeout(saveFileTitle,500);
				});
				$("#file_browser_info_pane .replace").click(replaceFile);
				$("#file_browser_info_pane .delete").click(deleteFile);
			}
		);
		
		return false;
	};
	
	function open(type,min_width,min_height) {
		if ($.browser.msie  && parseInt($.browser.version, 10) === 7) {
			alert("This feature is not supported in Internet Explorer 7.  Please upgrade your browser.");
			return false;
		}

		Type = type;
		MinWidth = min_width;
		MinHeight = min_height;
			
		// Figure out where to put the window.
		var width = BigTree.WindowWidth();
		var height = BigTree.WindowHeight();
		var left_offset = Math.round((width - 820) / 2);
		var top_offset = Math.round((height - 500) / 2);

		// Set BigTree's zIndex super high because TinyMCE will try to be on top
		BigTree.zIndexBackup = BigTree.zIndex;
		BigTree.zIndex = 500000;
		
		// Create the window.
		var overlay = $('<div class="bigtree_dialog_overlay" style="z-index:' + (BigTree.zIndex++) + ';">');
		
		Browser = $('<div id="file_browser" style="z-index: ' + (BigTree.zIndex++) + ';">');
		Browser.css({ top: top_offset + "px", left: left_offset + "px" });
		Browser.html('\
<div class="header">\
	<input class="form_search" id="file_browser_search" placeholder="Search" />\
	<span class="form_search_icon"></span>\
	<a href="#" class="button add_file">Upload Files</a>\
	<a href="#" class="button add_folder">New Folder</a>\
	<a href="#" class="button red delete_folder" style="display: none;">Delete Folder</a>\
	<span id="file_browser_type_icon"></span>\
	<h2 id="file_browser_type"><em class="title"></em><em class="suffix"></em></h2>\
</div>\
<ul id="file_browser_breadcrumb"><li><a href="#0">Home</a></li></ul>\
<div id="file_browser_upload_window" style="display: none;">\
	<span style="display: none;" id="file_browser_spinner" class="spinner"></span>\
	<iframe name="resource_frame" id="file_browser_upload_frame" style="display: none;" src="admin_root/ajax/file-browser/busy/"></iframe>\
	<form id="file_browser_upload_form" target="resource_frame" method="post" enctype="multipart/form-data" action="admin_root/ajax/file-browser/upload/">\
		<input type="hidden" name="MAX_FILE_SIZE" value="$max_file_size" />\
		<input type="file" name="file" id="file_browser_file_input" /> \
		<input type="submit" class="shorter blue" value="Upload" />\
	</form>\
</div>\
<form method="post" action="" id="file_browser_form">\
	<input type="hidden" id="file_browser_selected_file" value="" />\
	<div id="file_browser_contents"></div>\
	<div id="file_browser_info_pane"></div>\
	<section id="file_browser_size_pane"></section>\
	<div class="footer">\
		<input type="submit" class="button white" value="Cancel" id="file_browser_cancel" />\
		<input type="submit" class="button blue" value="Use Selected Item" style="display: none;" />\
	</div>\
</form>');

		$("body").append(overlay).append(Browser);
		
		// Hook the cancel, submit, and search.
		$("#file_browser_cancel").click(closeFileBrowser);
		$("#file_browser_form").submit(submitSelectedFile);
		$("#file_browser_search").keyup(function() {
			clearTimeout(StartSearchTimer);
			StartSearchTimer = setTimeout(search,300);
		});
		
		// Hide TinyMCE's default modal background, we're using our own.
		$("#mceModalBlocker, #mce-modal-block").hide();
		
		// Handle the clicks on the breadcrumb of folders
		$("#file_browser_breadcrumb").on("click","a",function() {
			var folder = $(this).attr("href").substr(1);

			if (Type == "image" || Type == "photo-gallery") {
				openImageFolder(folder);
			} else {
				openFileFolder(folder);
			}
			
			return false;
		});
		
		// Handle the create new folder / file clicks
		$("#file_browser .header .add_file").click(addFile);
		$("#file_browser .header .add_folder").click(addFolder);
		$("#file_browser .header .delete_folder").click(deleteFolder);
		
		// Open the right browser
		if (Type == "image" || Type == "photo-gallery") {
			imageBrowser();
		} else {
			fileBrowser();
		}
	};
	
	function openFileFolder(folder) {
		CurrentFolder = folder;
		$("#file_browser_selected_file").val("");
		$("#file_browser_info_pane").html("");
		$("#file_browser_form .footer .blue").hide();
		$("#file_browser_contents").scrollTop(0).load("admin_root/ajax/file-browser/get-files/", { folder: folder }, fileBrowserPopulated);
	};
	
	function openImageFolder(folder) {
		CurrentFolder = folder;
		$("#file_browser_selected_file").val("");
		$("#file_browser_info_pane").html("");
		$("#file_browser_form .footer .blue").hide();
		$("#file_browser_contents").scrollTop(0).load("admin_root/ajax/file-browser/get-images/", { minWidth: MinWidth, minHeight: MinHeight, folder: folder }, imageBrowserPopulated);
	};

	function replaceFile() {
		new BigTreeDialog({
			title: "Replace File",
			content: '<input type="hidden" name="replace" value="' + $(this).attr("data-replace") + '" /><fieldset><label>Select A File</label><input type="file" name="file" /></fieldset>',
			callback: replaceFileProcess,
			icon: "folder",
			alternateSaveText: "Replace File",
			preSubmissionCallback: true,
			cancelHook: cancelAdd
		});

		return false;
	};

	function replaceFileProcess(data) {
		$("body").append($('<iframe name="file_manager_upload_frame" style="display: none;" id="file_manager_upload_frame">'));
		$(".bigtree_dialog_form").last().attr("action","admin_root/ajax/file-browser/upload/").attr("target","file_manager_upload_frame");
		$(".bigtree_dialog_form").last().find("footer *").hide();
		$(".bigtree_dialog_form").last().find("footer").append($('<p style="line-height: 16px; color: #333;"><img src="admin_root/images/spinner.gif" alt="" style="float: left; margin: 0 5px 0 0;" /> Replacing file. Please wait…</p>'));
	};
	
	function saveFileTitle() {
		var title = $("#file_browser_detail_title_input").val();
		var file = $("#file_browser_selected_file").val();
		
		$.ajax("admin_root/ajax/file-browser/save-title/", { type: "POST", data: { file: file, title: title } });
	};
	
	function search() {
		var query = $("#file_browser_search").val();
		$("#file_browser_info_pane").html("");
		$("#file_browser_selected_file").val("");
		
		if (Type == "image" || Type == "photo-gallery") {
			$("#file_browser_contents").load("admin_root/ajax/file-browser/get-images/", { minWidth: MinWidth, minHeight: MinHeight, query: query, folder: CurrentFolder }, imageBrowserPopulated);
		} else {
			$("#file_browser_contents").load("admin_root/ajax/file-browser/get-files/", { query: query, folder: CurrentFolder }, fileBrowserPopulated);
		}
	};
	
	function setBreadcrumb(contents) {
		$("#file_browser_breadcrumb").html(contents);
	};
	
	function setTitleSuffix(suffix) {
		$("#file_browser_type .suffix").html(suffix);
	};

	function showDeleteFolder() {
		$("#file_browser .delete_folder").show();
	};
	
	function submitSelectedFile() {
		if (FieldName) {
			if (Type == "image" && AvailableThumbs.length) {
				chooseImageSize();
				return false;
			} else {
				FieldName.value = $("#file_browser_selected_file").val();
				return closeFileBrowser();
			}
		} else {
			if (Type == "image") {
				var input = $('<input type="hidden" name="' + CurrentlyKey + '">');
				input.val("resource://" + $("#file_browser_selected_file").val());
				var img = new $('<img alt="">');
				img.attr("src",$("#file_browser_selected_file").val());
				var container = $(document.getElementById(CurrentlyName));
				container.find("img, input").remove();
				container.append(input).find(".currently_wrapper").append(img);
				container.show();

				// If a user already selected something to upload, replace it
				container.siblings("input").get(0).customControl.clear();
			} else if (Type == "photo-gallery") {
				callback($("#file_browser_selected_file").val(),$("#file_browser_detail_title_input").val(),$(".file_browser_images .selected img").attr("src"));
			}
			return closeFileBrowser();
		}
	};
	
	function tinyMCEOpen(field_name,url,type,win) {
		CurrentlyName = false;
		// TinyMCE 3
		FieldName = win.document.forms[0].elements[field_name];
		if (!FieldName) {
			FieldName = $("#" + field_name).get(0);
		}
		open(type,false,false);
	};

	function uploadError(message,successes) {
		var last_dialog = $(".bigtree_dialog_form").last();
		last_dialog.find("p,fieldset,input").remove();
		last_dialog.find(".overflow").prepend($('<p class="error_message">' + message + '</p><p>' + successes + '</p>'));
		last_dialog.find("footer a").show().html("Ok");

		if (Type == "image" || Type == "photo-gallery") {
			openImageFolder(CurrentFolder);	
		} else {
			openFileFolder(CurrentFolder);
		}
	};

	return {
		disableCreate: disableCreate,
		enableCreate: enableCreate,
		finishedUpload: finishedUpload,
		formOpen: formOpen,
		hideDeleteFolder: hideDeleteFolder,
		setBreadcrumb: setBreadcrumb,
		setTitleSuffix: setTitleSuffix,
		showDeleteFolder: showDeleteFolder,
		tinyMCEOpen: tinyMCEOpen,
		uploadError: uploadError
	};

}(jQuery));

var BigTreeFormNavBar = (function() {

	var Container = false;
	var MoreContainer = false;
	var Nav = false;
	var NextButton = false;
	var Sections = false;
	var ContainerOffset = false;
	
	function init() {
		Container = $(".container");
		ContainerOffset = Container.offset().top;
		Nav = Container.find("nav a");
		NextButton = Container.find("footer .next");
		Sections = Container.find("form > section");

		// Generic tab controls
		Nav.click(function() {		
			if (window.scrollY > ContainerOffset) {
				$("html, body").animate({ scrollTop: ContainerOffset + 3 }, 200);
			}
			
			var href = $(this).attr("href").substr(1);
			Sections.hide();
			Nav.removeClass("active");
			$(this).addClass("active");
			$("#" + href).show();
			
			// Manage the "Next" buttons
			var index = Nav.index(this);
			if (index == Nav.length - 1) {
				NextButton.hide();
			} else {
				NextButton.show();				
			}
			
			return false;
		});

		// Next Button controls
		NextButton.click(function() {
			var tab = Nav.filter(".active");
			tab.removeClass("active");
			var next = tab.next("a").addClass("active");
			
			$("#" + next.attr("href").substr(1)).show();
			$("#" + tab.attr("href").substr(1)).hide();
			
			if (Nav.index(tab) == Nav.length - 2) {
				$(this).hide();
			}
			
			return false;
		});

		// Form Validation
		new BigTreeFormValidator(Container.find("form"),function(errors) {
			// Hide all the pages tab sections
			Sections.hide();
			// Unset all the active states on tabs
			Nav.removeClass("active");
			// Figure out what section the first error occurred in and show that section.
			Nav.filter("[href=#" + errors[0].parents("section").show().attr("id") + "]").addClass("active");
		});

		// For when there are too many tabs, we need to setup scrolling
		var calc_nav_container = Container.find("nav .more div");
		var nav_width = calc_nav_container.width();
		if (nav_width > 928) {
			// If we're larger than 928, we're splitting into pages
			MoreContainer = calc_nav_container.parent();
			
			var page_count = 0;
			var current_width = 0;
			var current_page = $('<div class="nav_page active">');
			Nav.each(function() {
				var width = $(this).width() + 47;
				
				if ((current_width + width) > 848) {
					page_count++;
					if (page_count > 1) {
						var lessButton = $('<a class="more_nav" href="#">').html("&laquo;").click(function() {
							MoreContainer.animate({ marginLeft: + (parseInt(MoreContainer.css("margin-left")) + 928) + "px" }, 300);
							return false;
						});
						current_page.prepend(lessButton);
					}
					
					var moreButton = $('<a class="more_nav" href="#">').html("&raquo;").click(function() {
						MoreContainer.animate({ marginLeft: + (parseInt(MoreContainer.css("margin-left")) - 928) + "px" }, 300);
						return false;
					});
					current_page.append(moreButton);
					
					MoreContainer.append(current_page);
					current_page = $('<div class="nav_page">');
					current_width = 0;
				}
				
				current_width += width;
				current_page.append($(this));
			});
			
			
			var lessButton = $('<a class="more_nav" href="#">').html("&laquo;").click(function() {
				MoreContainer.animate({ marginLeft: + (parseInt(MoreContainer.css("margin-left")) + 928) + "px" }, 300);
				return false;
			});
			current_page.prepend(lessButton);
			
			MoreContainer.append(current_page);
			calc_nav_container.remove();
		}
	}

	return { init: init };
}());


var BigTreeListMaker = function(settings) {
	return (function($,settings) {

		var Container;
		var Count = 0;
		var Keys = [];
		var Name;

		function addOption() {
			var html = '<li><span class="icon_sort"></span>';
			for (var x = 0; x < Keys.length; x++) {
				if (Keys[x].type == "select") {
					html += '<span><select class="custom_control" name="' + Name + '[' + Count + '][' + Keys[x].key + ']">';
					for (var v in Keys[x].list) {
						html += '<option value="' + htmlspecialchars(v) + '">' + htmlspecialchars(Keys[x].list[v]) + '</option>';
					}
					html += '</select></span>';
				} else {
					html += '<span><input type="text" name="' + Name + '[' + Count + '][' + Keys[x].key + ']" /></span>';
				}
			}
			html += '<a class="delete icon_small icon_small_delete" href="#"></a></li>';

			// Add the option, increment the count
			Container.find("ul").append(html);
			Count++;

			// We're guaranteed at least one option now, so show the header.
			Container.find("summary").show();
	
			return false;
		};
		
		function deleteOption() {
			ul = $(this).parents("ul").eq(0);
			$(this).parents("li").eq(0).remove();
			// Hide the header if we're out of options
			if (ul.find("li").length == 0) {
				ul.prev("summary").hide();
			}
	
			return false;
		};

		// Init routine
		Container = $(settings.element);
		Keys = settings.keys;
		Name = settings.name;

		var html = '<h4>' + settings.title + ' a href="#" class="add_option icon_small icon_small_add"></a></h4>';
		html += '<fieldset class="list_options_widget list_options_widget_' + Keys.length + '">';
		// Add column headers
		html += '<summary>';
		for (var i = 0; i < settings.columns.length; i++) {
			html += '<span>' + settings.columns[i] + '</span>';
		}
		html += '</summary>';
		// Add options
		html += '<ul>';
		var count = 0;
		for (var i in settings.existing) {
			html += '<li><span class="icon_sort"></span>';
			for (var x = 0; x < Keys.length; x++) {
				if (Keys[x].type == "select") {
					html += '<span><select class="custom_control" name="' + Name + '[' + count + '][' + Keys[x].key + ']">';
					for (var v in Keys[x].list) {
						html += '<option value="' + htmlspecialchars(v) + '"';
						if (v == settings.existing[i][Keys[x].key]) {
							html += ' selected="selected"';
						}
						html += '>' + htmlspecialchars(Keys[x].list[v]) + '</option>';
					}
					html += '</select></span>';
				} else {
					html += '<span><input type="text" name="' + name + '[' + count + '][' + Keys[x].key + ']" value="' + htmlspecialchars(settings.existing[i][Keys[x].key]) + '" /></span>';
				}
			}
			html += '<a class="delete icon_small icon_small_delete" href="#"></a></li>';
			count++;
		}
		html += '</ul>';
		Count = count;
		Container.html(html);

		// Hide the summary if we have no options
		if (!settings.existing || settings.existing.length == 0) {
			Container.find("summary").hide();
		}
		// Hook the add button
		Container.find(".add_option").click(addOption);
		// Hook delete buttons
		Container.on("click",".delete",deleteOption);
		// Make it sortable
		Container.sortable({ handle: ".icon_sort", axis: "y", containment: "parent", items: "li", placeholder: "ui-sortable-placeholder" });

		return { addOption: addOption };
	})(jQuery,settings);
};

var BigTreeManyToMany = function(settings) {
	return (function($,settings) {

		var Count = 0;
		var DeleteTarget;
		var Field;
		var Key;
		var Sortable;
		var KeepOptions;

		function addItem() {
			var select = Field.find("select").get(0);
			if (select.selectedIndex < 0) {
				return false;
			}

			var val = select.value;
			var text = select.options[select.selectedIndex].text;

			if (Sortable) {
				var li = $('<li><input type="hidden" name="' + Key + '[' + Count + ']" /><span class="icon_sort"></span><p></p><a href="#" class="icon_delete"></a></li>');
			} else {
				var li = $('<li><input type="hidden" name="' + Key + '[' + Count + ']" /><p></p><a href="#" class="icon_delete"></a></li>');		
			}
			li.find("p").html(text);
			li.find("input").val(val);
	
			// Remove the option from the select.
			if (!KeepOptions) {
				select.customControl.remove(val);
			}
			
			Field.find("ul").append(li);
			Field.trigger("addedItem", { element: li, index: Count });
			Count++;
			
			// Hide the instructions saying there haven't been any items tagged.
			Field.find("section").hide();
	
			return false;
		};
	
		function deleteItem(ev) {
			DeleteTarget = ev.currentTarget;
			
			new BigTreeDialog({
				title: "Delete Item",
				content: '<p class="confirm">Are you sure you want to delete this item?</p>',
				icon: "delete",
				alternateSaveText: "OK",
				callback: function() {
					var fieldset = $(DeleteTarget).parents("fieldset");
					// If this is the last item we're removing, show the instructions again.
					if ($(DeleteTarget).parents("ul").find("li").length == 1) {
						fieldset.find("section").show();
					}
					var li = $(DeleteTarget).parents("li");
					var val = li.find("input").val();
					var text = li.find("p").html();
					// Add the option back to the select
					if (!KeepOptions) {
						fieldset.find("select")[0].customControl.add(val,text);
					}
		
					li.remove();
					fieldset.trigger("removedItem", { value: val, description: text });
				}
			});
	
			return false;
		};

		// 4.2 init routine
		if (is_object(settings)) {
			Field = $("#" + settings.id);
			Count = settings.count;
			Key = settings.key;
			if (settings.sortable) {
				Sortable = true;
			}
			if (settings.keepOptions) {
				KeepOptions = true;
			}
		} else {
			Field = $("#" + arguments[0]);
			Count = arguments[1];
			Key = arguments[2];
			if (arguments[3]) {
				Sortable = true;
			}
			if (arguments[4]) {
				KeepOptions = true;
			}
		}

		if (Sortable) {
			Field.find("ul").sortable({ items: "li", handle: ".icon_sort" });
		}
		Field.find(".add").click(addItem);
		Field.on("click",".icon_delete",deleteItem);
		

	})(jQuery,settings);
};

// !BigTreeFieldSelect
var BigTreeFieldSelect = Class.extend({
	addCallback: false,
	currentElement: 0,
	elements: false,
	container: false,
	
	init: function(selector,elements,callback) {
		fs = $('<div class="field_selector">');
		ophtml = "";
		for (i = 0; i < elements.length; i++) {
			ophtml += '<a href="#' + elements[i].title + '">' + elements[i].field + '</a>';
		}
		if (elements.length == 0) {
			fs.html('<a href="#" class="add_field"></a><div><span class="dd">' + ophtml + '</span></div><span class="handle"></span><span class="current"><p></p>' + ophtml + '</span>');
		} else {
			fs.html('<a href="#" class="add_field"></a><div><span class="dd">' + ophtml + '</span></div><span class="handle"></span><span class="current"><p>' + elements[0].field + '</p>' + ophtml + '</span>');
		}
		$(selector).prepend(fs);
		
		fs.find("p, .handle").click($.proxy(this.click,this));
		
		fs.find(".dd").on("click","a",$.proxy(function(ev) {
			el = ev.currentTarget;
			p = $(el).parents(".field_selector");
			p.find("p").html($(el).html());
			i = p.find(".dd").hide().find("a").index(el);
			this.currentElement = i;
			return false;
		},this));
		
		fs.find(".add_field").click($.proxy(function() {
			el = this.elements[this.currentElement];
			this.addCallback(el,this);
			return false;
		},this));
		
		this.elements = elements;
		this.container = fs;
		this.addCallback = callback;
		
		if (this.elements.length == 0) {
			this.container.hide();
		}
	},
	
	addField: function(field,title) {
		this.container.find(".dd").append($('<a href="#' + title + '">' + field + '</a>'));
		this.container.find(".current").append($('<a href="#' + title + '">' + field + '</a>'));
		this.elements.push({ field: field, title: title });
		if (this.elements.length == 1) {
			this.container.find("p").html(this.elements[0].field);
			this.container.show();
		}
	},
	
	click: function(ev) {
		p = $(ev.currentTarget);
		dd = p.parents(".field_selector").find(".dd");
		if (dd.hasClass("open")) {
			this.close();
		} else {
			if (dd.find("a").length > 1) {
				dd.show().addClass("open");
				this.BoundWindowClick = $.proxy(this.close,this);
				$("body").bind("click",this.BoundWindowClick);
			}
		}
		return false;
	},
	
	close: function() {
		$(window).unbind("click",this.BoundWindowClick);
		$(".field_selector .dd").removeClass("open").hide();
	},
	
	removeCurrent: function() {
		this.container.find(".dd a").eq(this.currentElement).remove();
		this.container.find(".current a").eq(this.currentElement).remove();
		this.elements.splice(this.currentElement,1);
		this.currentElement = 0;
		if (this.elements.length == 0) {
			this.container.hide();
		} else {
			this.container.find("p").html(this.elements[0].field);
		}
	}
});

// !BigTreeFormValidator
var BigTreeFormValidator = Class.extend({
	form: false,
	callback: false,
	
	init: function(selector,callback) {
		this.form = $(selector);
		this.form.submit($.proxy(this.validateForm,this));
		if (callback) {
			this.callback = callback;
		}
	},
	
	validateForm: function(ev,in_dialog,embedded) {
		errors = [];
		this.form.find(".form_error").removeClass("form_error");
		this.form.find(".form_error_reason").remove();
		
		this.form.find("input.required, select.required, textarea.required").each(function() {
			// TinyMCE 3
			if ($(this).nextAll(".mceEditor").length) {
				val = tinyMCE.get($(this).attr("id")).getContent();
			// Tiny MCE 4
			} else if ($(this).prevAll(".mce-tinymce").length) {
				val = tinymce.get($(this).attr("id")).getContent();
			// File/Image Uploads
			} else if ($(this).parents("div").nextAll(".currently, .currently_file").length) {
				val = $(this).parents("div").nextAll(".currently, .currently_file").find("input").val();
				if (!val) {
					val = $(this).val();
				}
			// Regular input fields
			} else {
				val = $(this).val();
			}
			if (!val) {
				errors[errors.length] = $(this);
				$(this).parents("fieldset").addClass("form_error");
				$(this).prevAll("label").append($('<span class="form_error_reason">Required</span>'));
				$(this).parents("div").prevAll("label").append($('<span class="form_error_reason">Required</span>'));
			}
		});
		
		this.form.find("input.numeric").each(function() {
			if (isNaN($(this).val())) {
				errors[errors.length] = $(this);
				$(this).parents("fieldset").addClass("form_error");
				$(this).prevAll("label").append($('<span class="form_error_reason">This Field Must Be Numeric</span>'));
			}
		});
		
		this.form.find("input.email").each(function() {
			reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			val = $(this).val();
			if (val && !reg.test(val)) {
				errors[errors.length] = $(this);
				$(this).parents("fieldset").addClass("form_error");
				$(this).prevAll("label").append($('<span class="form_error_reason">This Field Must Be An Email Address</span>'));
			}
		});
		
		this.form.find("input.link").each(function() {
			reg = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
			val = $(this).val();
			if (val && !reg.test(val)) {
				errors[errors.length] = $(this);
				$(this).parents("fieldset").addClass("form_error");
				$(this).prevAll("label").append($('<span class="form_error_reason">This Field Must Be A Valid URL</span>'));
			}
		});

		// If this is an embedded form, we want to generate a hash of everything
		complete_submission = "";
		if ($("#bigtree_hashcash_field").length) {
			this.form.find("input,select,textarea").each(function() {
				if ($(this).is("textarea") && $(this).css("display") == "none") {
					var mce = tinyMCE.get($(this).attr("id"));
					if (mce) {
						complete_submission += mce.getContent();
					}
				} else {
					t = $(this).attr("type");
					if (t != "file" && $(this).attr("name")) {
						if ((t != "radio" && t != "checkbox") || $(this).is(":checked")) {
							complete_submission += $(this).val();
						}
					}
				}
			});
			$("#bigtree_hashcash_field").val(md5(complete_submission));
		}
		
		if (this.form.find(".form_error").length) {
			this.form.find(".warning_message").hide();
			this.form.find(".error_message").show();
			if (!in_dialog) {
				$("html, body").animate({ scrollTop: $(".container").offset().top }, 200);
				if (window.parent.BigTreeEmbeddableForm) {
					window.parent.BigTreeEmbeddableForm.scrollToTop();
				}
			} else {
				this.form.find(".overflow, #callout_resources").animate({ scrollTop: 0 }, 200);
			}
			if (this.callback) {
				this.callback(errors);
			}
			ev.stopImmediatePropagation();
			ev.stopPropagation();
			ev.preventDefault();
			return false;
		} else {
			return true;
		}
	}
});

// !BigTreeToolTip
var BigTreeToolTip = Class.extend({
	container: false,
	position: false,
	selector: false,
	
	init: function(selector,content,position,icon,auto_close) {
		// If you don't specify an icon, just use the alert one.
		if (!icon) {
			icon = "alert";
		}
		// Create the container, add the tip to the container.
		container = $('<div class="tooltip" style="display: none;">');
		// The arrow is below the tip if the position is above.
		if (position != "above") {
			container.append($('<span class="arrow">'));
		}
		tip = $('<article>');
		tip.html('<section class="icon_tooltip icon_growl_' + icon + '"></section><section class="content">' + content + '</section>');
		// If the tip should stay open, add a close button.  Otherwise it'll close when you roll off the target.
		if (!auto_close) {
			tip.append($('<a href="#" class="close"></a>'));
			tip.find(".close").click($.proxy(this.close,this));
		}
		container.append(tip);
		container.addClass("tooltip_" + position);
		if (position == "above") {
			container.append($('<span class="arrow">'));
		}
		$("body").append(container);
		
		this.position = position;
		this.container = container;
		this.selector = selector;
		
		if (auto_close) {
			$(selector).mouseenter($.proxy(this.showTip,this));
			$(selector).mouseleave($.proxy(function() {
				this.container.stop().fadeTo(200, 0, function() {
					$(this).hide();
				});
				BigTree.zIndex--;
			},this));
		} else {
			$(selector).click($.proxy(this.showTip,this));
		}
	},
	
	close: function() {
		this.container.stop().fadeTo(200, 0, function() { $(this).hide(); });
		BigTree.zIndex--;
		return false;
	},
	
	showTip: function() {
		// Figure out where the target is in the DOM, add the container to the DOM so we can get its width/height for some positions.
		offset = $(this.selector).offset();
		w = $(this.selector).width();
		h = $(this.selector).height();
		
		// The tip is below the target.
		if (this.position == "below") {
			l = offset.left - 28 + Math.round(w / 2);
			t = offset.top + h + 5;
		}
		
		// The tip is to the right of the target.
		if (this.position == "right") {
			l = offset.left + w + 5;
			t = offset.top - 28 + Math.round(h / 2);
		}
		
		// The tip is to the left of the target.
		if (this.position == "left") {
			l = offset.left - container.width() - 5;
			t = offset.top - 28 + Math.round(h / 2);
		}
		
		// The tip is above of the target.
		if (this.position == "above") {
			l = offset.left - 28 + Math.round(w / 2);
			t = offset.top - container.height() - 5;
		}
		
		this.container.css({ left: l + "px", top: t + "px", zIndex: (BigTree.zIndex++) }).stop().fadeTo(200, 1);
	}
});

// !BigTree Foundry Browser Class
var BigTreeFoundryBrowser = Class.extend({

	onComplete: false,

	init: function(directory,oncomplete,cloud_disabled,file,location,container,base_lock) {
		this.onComplete = oncomplete;
		overlay = $('<div class="bigtree_dialog_overlay" style="z-index: ' + (BigTree.zIndex++) + ';">');
		browserwindow = $('<div id="bigtree_foundry_browser_window" style="z-index: ' + (BigTree.zIndex++) + ';">').html('<h2>File Browser</h2><form id="bigtree_foundry_browser_form" method="post" action="">Loading&hellip;</form>');
		$("body").append(overlay).append(browserwindow);
		if (base_lock) {
			$("#bigtree_foundry_browser_form").load("admin_root/ajax/developer/extensions/file-browser/", { base_directory: directory, directory: directory, cloud_disabled: cloud_disabled, file: file, location: location, container: container });
		} else {
			$("#bigtree_foundry_browser_form").load("admin_root/ajax/developer/extensions/file-browser/", { directory: directory, cloud_disabled: cloud_disabled, file: file, location: location, container: container });
		}
		leftd = parseInt((BigTree.WindowWidth() - 602) / 2);
		topd = parseInt((BigTree.WindowHeight() - 402) / 2);

		$("#bigtree_foundry_browser_window").css({ "top": topd + "px", "left": leftd + "px" });
		$("#bigtree_foundry_browser_form").submit($.proxy(this.BrowserSubmit,this));
	},

	BrowserSubmit: function(ev) {
		data = { file: $("#bigtree_foundry_file").val(), directory: $("#bigtree_foundry_directory").val(), container: $("#bigtree_foundry_container").val(), location: $("#bigtree_foundry_location").val() };
		this.onComplete(data);
		$(".bigtree_dialog_overlay").last().remove();
		$("#bigtree_foundry_browser_window").remove();
		BigTree.zIndex -= 2;
		return false;

	}
});

// !BigTree Object
var BigTree = {
	stickyControls: false,
	stickyControlsTop: false,
	stickyControlsStuck: false,
	zIndex: 1000,

	CleanHref: function(href) {
		return href.substr(href.indexOf("#")+1);
	},

	CleanObject: function(o) {
		if (typeof o != "object") {
			return o;
		}

		if (Object.prototype.toString.call(o) === '[object Array]') {
			var j = [];
			for (i = 0; i < o.length; i++) {
				if (typeof o[i] != "undefined") {
					j[j.length] = o[i];
				}
			}
		} else {
			var j = {};
			for (i in o) {
				j[i] = BigTree.CleanObject(o[i]);
			}
		}
		return j;
	},

	FormHooks: function(selector) {
		$(selector).on("click",".remove_resource",function() {
			p = $(this).parent();
			if (p.hasClass("currently_file")) {
				p.remove();
			} else {
				p.hide().find("input, img").remove();
			}
			return false;
		}).on("click",".form_image_browser",function() {
		// Form Image Browser
			options = $.parseJSON($(this).attr("data-options"));
			field = $(this).attr("href").substr(1);
			BigTreeFileManager.formOpen("image",field,options);
			return false;
		});
	},

	growltimer: false,
	growling: false,
	Growl: function(title,message,time,type) {
		if (!time) {
			time = 5000;
		}
		if (!type) {
			type = "success";
		}
		if (BigTree.Growling) {
			$("#growl").append($('<article><a class="close" href="#"></a><span class="icon_growl_' + type + '"></span><section><h3>' + title + '</h3><p>' + message + '</p></section></article>'));
			BigTree.Growltimer = setTimeout("$('#growl').fadeOut(500); BigTree.Growling = false;",time);
		} else {
			$("#growl").html('<article><a class="close" href="#"></a><span class="icon_growl_' + type + '"></span><section><h3>' + title + '</h3><p>' + message + '</p></section></article>');
			BigTree.Growling = true;
			$("#growl").fadeIn(500, function() { BigTree.Growltimer = setTimeout("$('#growl').fadeOut(500); BigTree.Growling = false;",time); });
		}
	},

	ParserWatch: function() {
		name = $(this).attr("name");
		value = $(this).val();
		t = $('<textarea class="parser" name="' + name + '">');
		t.val(value);
		t.mouseleave(function() {
			name = $(this).attr("name");
			value = $(this).val();
			i = $('<input class="parser" name="' + name + '">');
			i.val(value);
			i.focus(BigTree.ParserWatch);
			i.replaceAll(this);
		});
		t.replaceAll(this);
		t.focus();
	},
	
	
	// Thanks to John Resig and Benji York
	// http://stackoverflow.com/questions/141348/what-is-the-best-way-to-parse-a-time-into-a-date-object-from-user-input-in-javas
	ParseTime: function(time) {
		var d = new Date();
		time = time.match(/(\d+)(?::(\d\d))?\s*([pP]?)/);
		if (time) {
			d.setHours(parseInt(time[1],10) + (time[3] ? 12 : 0));
			d.setMinutes(parseInt(time[2],10) || 0);
		} else {
			d.setHours(0);
			d.setMinutes(0);
		}
		return d;
	},
	
	SetPageCount: function(selector,pages,current_page) {
		// We have to have at least one page.
		if (pages == 0) {
			pages = 1;
		}

		// Figure out what previous and next buttons should do.
		if (current_page == 1) {
			prev_page = 1;
		} else {
			prev_page = current_page - 1;
		}
		if (current_page == pages) {
			next_page = pages;
		} else {
			next_page = current_page + 1;
		}
		
		// If we have 10 or less pages, just draw them all.
		if (pages < 11) {
			start_page = 1;
			end_page = pages;
		// Otherwise we need to figure out where we are...
		} else {
			if (current_page < 7) {
				start_page = 1;
				end_page = 9;
			} else if (current_page > pages - 7) {
				start_page = pages - 9;
				end_page = pages;
			} else {
				start_page = current_page - 4;
				end_page = current_page + 5;
			}
		}

		content = '<a class="first" href="#' + prev_page + '"><span>&laquo;</span></a>';
		if (start_page > 1) {
			content += '<a class="ellipsis" href="#1">…</a>';
		}
		for (i = start_page; i <= end_page; i++) {
			content += '<a href="#' + i + '"';
			if (i == current_page) {
				content += ' class="active"';
			}
			content += '>' + i + '</a>';
		}
		if (end_page < pages) {
			content += '<a class="ellipsis" href="#' + pages + '">…</a>';
		}
		content += '<a class="last" href="#' + next_page + '"><span>&raquo;</span></a>';
		
		$(selector).html(content);
		if (pages == 1) {
			$(selector).hide();
		} else {
			$(selector).show();
		}
	},

	SettingsAnimation: false,
	
	ThrowError: function(message) {
		alert(message);
	},
	
	WindowWidth: function() {
		if (window.innerWidth) {
			windowWidth = window.innerWidth;
		} else if (document.documentElement && document.documentElement.clientWidth) {
			windowWidth = document.documentElement.clientWidth;
		} else if (document.body) {
			windowWidth = document.body.clientWidth;
		}
		return windowWidth;
	},

	WindowHeight: function() {
		if (window.innerHeight) {
			windowHeight = window.innerHeight;
		} else if (document.documentElement && document.documentElement.clientHeight) {
			windowHeight = document.documentElement.clientHeight;
		} else if (document.body) {
			windowHeight = document.body.clientHeight;
		}
		return windowHeight;
	}
}

// !BigTree Quick Loader — adapted from Ben Plum's Pronto jQuery Plugin @ https://github.com/benplum/Pronto
var BigTreeQuickLoader = {

	init: function() {
		var supported = window.history && window.history.pushState && window.history.replaceState;
		if (!supported) {
			return;
		}

		scripts = [];
		$("head > script").each(function() {
			src = $(this).attr("src");
			if (src != "admin_root/js/lib.js" && src != "admin_root/js/main.js") {
				scripts[scripts.length] = src;
			}
		});
		css = [];
		$("head > link[rel=stylesheet]").each(function() {
			src = $(this).attr("href");
			if (src != "admin_root/css/main.css") {
				css[css.length] = src;
			}
		});

		pageData = $("#page").html();
		// Big pages are going to fail when pushing states
		try {
			history.replaceState({
				url: window.location.href,
				data: {
					"title": $("head").find("title").text(),
					"page": $("#page").html(),
					"active_nav": $("nav.main > section > ul > li").index($("nav.main li.active")),
					"scripts": scripts,
					"css": css
				}
			}, "state-" + window.location.href, window.location.href);
			
			$(window).on("popstate", this.pop);
			$("body").on("click","a",this.click);
	
			this.url = window.location.href;
		} catch (error) {}
	},

	click: function(e) {
		var link = e.currentTarget;
		
		// Ignore everything but normal clicks
		if ((e.which > 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) ||
			(window.location.protocol !== link.protocol || window.location.host !== link.host) ||
			(link.hash && link.href.replace(link.hash, '') === window.location.href.replace(location.hash, '') || link.href === window.location.href + '#')) {
			return;
		}
		if ($(link).hasClass("ignore_quick_loader") || $(link).attr("target")) {
			return;
		}
		
		e.preventDefault();
		e.stopPropagation();
		
		// Some timers might be running
		if (BigTree.localLockTimer) {
			clearInterval(BigTree.localLockTimer);
		}
		if (BigTree.localTimer) {
			clearInterval(BigTree.localTimer);
		}

		BigTreeQuickLoader.request(link.href);
	},

	pop: function(e) {
		var state = e.originalEvent.state;
		if (state !== null && (state.url !== BigTreeQuickLoader.url)) {
			BigTreeQuickLoader.render(state.url, state.data, false);
		}
	},

	render: function(url,data,push) {
		$(window).scrollTop(0);

		// Load new scripts
		scripts_to_load = data.scripts;
		if (scripts_to_load) {
			$("head > script").each(function() {
				src = $(this).attr("src");
				// If we already have it included, don't reload it
				if (data.scripts.indexOf(src) > -1) {
					scripts_to_load[data.scripts.indexOf(src)] = null;
				}
			});
			for (i = 0; i < scripts_to_load.length; i++) {
				src = scripts_to_load[i];
				if (src) {
					$.getScript(src);
				}
			}
		}

		// Load new CSS
		css_to_load = data.css;
		if (css_to_load) {
			$("head > link[rel=stylesheet]").each(function() {
				src = $(this).attr("href");
				// If we already have it included, don't reload it
				if (data.css.indexOf(src) > -1) {
					css_to_load[data.css.indexOf(src)] = null;
				}
			});
			for (i = 0; i < css_to_load.length; i++) {
				src = css_to_load[i];
				if (src) {
					css = $("head").append($('<link rel="stylesheet" type="text/css" media="screen" href="' + src + '">'));
				}
			}
		}

		document.title = data.title;
		$("#page").html(data.page);
		$("nav.main li, nav.main li > a").removeClass("active");
		$("nav.main > section > ul > li").eq(data.active_nav).addClass("active").find("a").eq(0).addClass("active");

		BigTreeCustomControls();
		BigTreePageLoadHooks();
		
		// Push new states to the stack
		if (push) {
			try {
				history.pushState({
					url: url,
					data: data
				}, "state-" + url, url);
			} catch (error) {
				// This state was too big, so stop watching for pops and clicks
				$(window).unbind("popstate", this.pop);
				$("body").off("click","a",this.click);
			}
		}
		
		BigTreeQuickLoader.url = url;
	},

	request: function(url) {
		// Call new content
		$.ajax({
			url: url,
			headers: { "BigTree-Partial": "True" },
			dataType: "json",
			success: function(response) {
				BigTreeQuickLoader.render(url,response,true);
			},
			error: function(response) {
				window.location.href = url;
			}
		});
	}
};

var BigTreeCallouts = {
	count: 0,

	init: function(container,key,noun,group) {
		$(container).on("click",".add_callout",function() {
			BigTreeCallouts.activeContainer = $(this).parent();
			$.ajax("admin_root/ajax/callouts/add/", { type: "POST", data: { count: BigTreeCallouts.count, group: group, key: key }, complete: function(response) {
				new BigTreeDialog({
					title: "Add " + noun,
					content: response.responseText,
					icon: "callout",
					preSubmissionCallback: true,
					callback: function(e) {		
						e.preventDefault();
						
						article = BigTreeCallouts.GetCallout();
						if (!article) {
							return false;
						}
		
						// Add the callout and hide the dialog.
						$(BigTreeCallouts.activeContainer).find(".contain").append(article);
						last_dialog.parents("div").remove();
						last_dialog.remove();
						$(".bigtree_dialog_overlay").last().remove();
						
						// Fill out the callout description.
						article.find("h4").html(BigTreeCallouts.description + '<input type="hidden" name="' + key + '[' + BigTreeCallouts.number + '][display_title]" value="' + htmlspecialchars(BigTreeCallouts.description) + '" />');
						
						BigTreeCallouts.count++;
						
						return false;
					}
				});
			}});
			
			return false;
		}).on("click",".icon_edit",function() {
			BigTreeCallouts.current = $(this).parents("article");
			
			$.ajax("admin_root/ajax/callouts/edit/", { type: "POST", data: { count: BigTreeCallouts.count, data: BigTreeCallouts.current.find(".callout_data").val(), group: group, key: key }, complete: function(response) {
				new BigTreeDialog({
					title: "Edit " + noun,
					content: response.responseText,
					icon: "callout",
					preSubmissionCallback: true,
					callback: function(e) {
						e.preventDefault();
						
						article = BigTreeCallouts.GetCallout();
						if (!article) {
							return false;
						}
		
						BigTreeCallouts.current.replaceWith(article);
						last_dialog.parents("div").remove();
						last_dialog.remove();
						$(".bigtree_dialog_overlay").last().remove();
						
						article.find("h4").html(BigTreeCallouts.description + '<input type="hidden" name="' + key + '[' + BigTreeCallouts.number + '][display_title]" value="' + htmlspecialchars(BigTreeCallouts.description) + '" />');
						
						BigTreeCallouts.count++;
						
						return false;
					}
				});
			}});
			
			return false;
		}).on("click",".icon_delete",function() {
			new BigTreeDialog({
				title: "Delete " + noun,
				content: '<p class="confirm">Are you sure you want to delete this ' + noun.toLowerCase() + '?</p>',
				callback: $.proxy(function() { $(this).parents("article").remove(); },this),
				icon: "delete",
				alternateSaveText: "OK"
			});
			return false;
		}).find(".contain").sortable({ containment: "parent", handle: ".icon_drag", items: "article", placeholder: "ui-sortable-placeholder", tolerance: "pointer" });
	},

	GetCallout: function() {
		last_dialog = $(".bigtree_dialog_form").last();

		// Validate required fields.
		v = new BigTreeFormValidator(last_dialog);
		if (!v.validateForm(false,true)) {
			return false;
		}
		
		article = $('<article>');
		article.html('<h4></h4><p>' + $("#callout_type select").get(0).options[$("#callout_type select").get(0).selectedIndex].text + '</p><div class="bottom"><span class="icon_drag"></span><a href="#" class="icon_delete"></a></div>');
		
		BigTreeCallouts.number = last_dialog.find("input.callout_count").val();
		// Try our best to find some way to describe the callout
		BigTreeCallouts.description = "";
		BigTreeCallouts.descriptionField = last_dialog.find("[name='" + last_dialog.find(".display_field").val() + "']");
		if (BigTreeCallouts.descriptionField.is('select')) {
			BigTreeCallouts.description = BigTreeCallouts.descriptionField.find("option:selected").text();
		} else {
			BigTreeCallouts.description = BigTreeCallouts.descriptionField.val();
		}
		if ($.trim(BigTreeCallouts.description) == "") {
			BigTreeCallouts.description = last_dialog.find(".display_default").val();
		}
		
		// Append all the relevant fields into the callout field so that it gets saved on submit with the rest of the form.
		last_dialog.find("input, textarea, select").each(function() {
			if ($(this).attr("type") != "submit") {
				if ($(this).is("textarea") && $(this).css("display") == "none") {
					var mce = tinyMCE.get($(this).attr("id"));
					if (mce) {
						mce.save();
						tinyMCE.execCommand('mceRemoveControl',false,$(this).attr("id"));
					}
				}
				$(this).hide().get(0).className = "";
				article.append($(this));
			}
		});

		return article;
	}
};
