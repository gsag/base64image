/*
 * Created by ALL-INKL.COM - Neue Medien Muennich - 04. Feb 2014
 * Licensed under the terms of GPL, LGPL and MPL licenses.
 */
CKEDITOR.dialog.add("base64imageDialog", function (editor) {
	
		var t = null,
			selectedImg = null,
			orgWidth = null, orgHeight = null,
			imgPreview = null, urlCB = null, urlI = null, fileCB = null, imgScal = 1, lock = true, altCB = null,
			altTextCharLimit = 100;
	
		var infoProgressMessages = {
			empty: "",
			standard: "Gostaria de fornecer textos alternativos melhores? </br>" +
			"Veja aqui algumas dicas para melhorar a descrição de imagens",
			uploading: "Tentando gerar texto alternativo para a imagem..."
		}
	
		var translatorToken = {
			token: undefined,
			timeout: undefined
		}
	
		/* Check File Reader Support */
		function fileSupport() {
			var r = false, n = null;
			try {
				if (FileReader) {
					var n = document.createElement("input");
					if (n && "files" in n) r = true;
				}
			} catch (e) { r = false; }
			n = null;
			return r;
		}
		var fsupport = fileSupport();
	
		/* Load preview image */
		function imagePreviewLoad(s) {
	
			/* no preview */
			if (typeof (s) != "string" || !s) {
				imgPreview.getElement().setHtml("");
				return;
			}
	
			/* Create image */
			var i = new Image();
	
			/* Display loading text in preview element */
			imgPreview.getElement().setHtml("Carregando...");
	
			/* When image is loaded */
			i.onload = function () {
	
				/* Remove preview */
				imgPreview.getElement().setHtml("");
	
				/* Set attributes */
				if (orgWidth == null || orgHeight == null) {
					t.setValueOf("tab-properties", "width", this.width);
					t.setValueOf("tab-properties", "height", this.height);
					imgScal = 1;
					if (this.height > 0 && this.width > 0) imgScal = this.width / this.height;
					if (imgScal <= 0) imgScal = 1;
				} else {
					orgWidth = null;
					orgHeight = null;
				}
				this.id = editor.id + "previewimage";
				this.setAttribute("style", "max-width:400px;max-height:100px;");
				this.setAttribute("alt", "");
	
				/* Insert preview image */
				try {
					var p = imgPreview.getElement().$;
					if (p) p.appendChild(this);
				} catch (e) { }
			};
	
			/* Error Function */
			i.onerror = function () { imgPreview.getElement().setHtml(""); };
			i.onabort = function () { imgPreview.getElement().setHtml(""); };
	
			/* Load image */
			i.src = s;
		}
	
		/* Change input values and preview image */
		function imagePreview(src) {
	
			/* Remove preview */
			imgPreview.getElement().setHtml("");
	
			if (src == "base64") {
	
				/* Disable Checkboxes */
				if (urlCB) urlCB.setValue(false, true);
				if (fileCB) fileCB.setValue(false, true);
	
			} else if (src == "url") {
	
				/* Ensable Image URL Checkbox */
				if (urlCB) urlCB.setValue(true, true);
				if (fileCB) fileCB.setValue(false, true);
	
				/* Load preview image */
				if (urlI) {
					imagePreviewLoad(urlI.getValue());
	
					/* If enabled and has no alternative text setted,
					   it tries to give an alternative text to the uploaded image 
					 */
					if (altCB.getValue() && t.getContentElement("tab-source", "alt").getValue() == "") {
						processAlternativeTextFromUploadedImage(urlI.getValue(), src);
					} else {
						fadeElementsAfterUpload();
						setTextForInfoProgress(infoProgressMessages.standard);
					}
				}
	
			} else if (fsupport) {
	
				/* Ensable Image File Checkbox */
				if (urlCB) urlCB.setValue(false, true);
				if (fileCB) fileCB.setValue(true, true);
	
				/* Read file and load preview */
				var fileI = t.getContentElement("tab-source", "file");
				var n = null;
				try { n = fileI.getInputElement().$; } catch (e) { n = null; }
				if (n && "files" in n && n.files && n.files.length > 0 && n.files[0]) {
					if ("type" in n.files[0] && !n.files[0].type.match("image.*")) return;
					if (!FileReader) return;
					imgPreview.getElement().setHtml("Carregando...");
					var fr = new FileReader();
					fr.onload = (function (f) {
						return function (e) {
							imgPreview.getElement().setHtml("");
							imagePreviewLoad(e.target.result);
	
							/* If enabled and has no alternative text setted,
							it tries to give an alternative text to the uploaded image 
							*/
							if (altCB.getValue() && t.getContentElement("tab-source", "alt").getValue() == "") {
								processAlternativeTextFromUploadedImage(e.target.result, 'file');
							} else {
								fadeElementsAfterUpload();
								setTextForInfoProgress(infoProgressMessages.standard);
							}
	
						};
					})(n.files[0]);
					fr.onerror = function () { imgPreview.getElement().setHtml(""); };
					fr.onabort = function () { imgPreview.getElement().setHtml(""); };
					fr.readAsDataURL(n.files[0]);
				}
			}
		};
	
		/* Calculate image dimensions */
		function getImageDimensions() {
			var o = {
				"w": t.getContentElement("tab-properties", "width").getValue(),
				"h": t.getContentElement("tab-properties", "height").getValue(),
				"uw": "px",
				"uh": "px"
			};
			if (o.w.indexOf("%") >= 0) o.uw = "%";
			if (o.h.indexOf("%") >= 0) o.uh = "%";
			o.w = parseInt(o.w, 10);
			o.h = parseInt(o.h, 10);
			if (isNaN(o.w)) o.w = 0;
			if (isNaN(o.h)) o.h = 0;
			return o;
		}
	
		/* Set image dimensions */
		function imageDimensions(src) {
			var o = getImageDimensions();
			var u = "px";
			if (src == "width") {
				if (o.uw == "%") u = "%";
				o.h = Math.round(o.w / imgScal);
			} else {
				if (o.uh == "%") u = "%";
				o.w = Math.round(o.h * imgScal);
			}
			if (u == "%") {
				o.w += "%";
				o.h += "%";
			}
			t.getContentElement("tab-properties", "width").setValue(o.w),
				t.getContentElement("tab-properties", "height").setValue(o.h)
		}
	
		/* Set integer Value */
		function integerValue(elem) {
			var v = elem.getValue(), u = "";
			if (v.indexOf("%") >= 0) u = "%";
			v = parseInt(v, 10);
			if (isNaN(v)) v = 0;
			elem.setValue(v + u);
		}
	
		if (fsupport) {
			/* Dialog with file and url image source */
			var sourceElements = [
				{
					type: "html",
					className: "fadeAfterUpload",
					html: "<h1><strong>Envie uma imagem via URL ou através de seu computador</strong></h1>"
				},
				{
					type: "hbox",
					widths: ["0px"],
					padding: "0px",
					className: "fadeAfterUpload",
					children: [
						{
							type: "checkbox",
							id: "urlcheckbox",
							style: "margin-top:5px; display:none;",
							label: editor.lang.common.url + ":"
						},
						{
							type: "text",
							id: "url",
							label: editor.lang.common.url + ":",
							onChange: function () { imagePreview("url"); }
						}
					]
				},
				{
					type: "hbox",
					widths: ["0px"],
					padding: "0px",
					className: "fadeAfterUpload",
					children: [
						{
							type: "checkbox",
							id: "filecheckbox",
							style: "margin-top:5px; display:none;",
							label: editor.lang.common.upload + ":"
						},
						{
							type: "file",
							id: "file",
							label: editor.lang.common.upload + ":",
							onChange: function () { imagePreview("file"); }
						}
					]
				},
				{
					type: "hbox",
					widths: ["70px"],
					className: "fadeAfterUpload",
					children: [
						{
							type: "checkbox",
							id: "altcheckbox",
							style: "margin: 2.5px 0 2.5px 0",
							label: editor.lang.base64image.altCheckbox,
							default: "checked"
						}
					]
				},
				{
					type: "html",
					id: "preview",
					html: new CKEDITOR.template("<div style=\"text-align:center;\"></div>").output()
				},
				{
					type: "html",
					id: "altprogress",
					html: new CKEDITOR.template("<section class='cke_alt_progress'>" +
													"<p id='infoprogress'><span></span>" +
													"<i class='alt-progress-loader'/></p>" +
												"</section>").output(),
				},
				{
					type: "text",
					id: "alt",
					label: editor.lang.base64image.alt + ': (0/' + altTextCharLimit + ')',
					maxLength: altTextCharLimit
				},
				{
					type: "textarea",
					id: "alt_long_desc",
					label: "Descrição longa: (Opcional)"
				}
			];
	
		} else {
			/* Dialog with url image source */
			var sourceElements = [
				{
					type: "html",
					id: "tabTitle",
					html: new CKEDITOR.template("<h1><strong>Envie uma imagem via URL ou através de seu computador</strong></h1>").output()
				},
				{
					type: "hbox",
					widths: ["0px"],
					padding: "0px",
					className: "fadeAfterUpload",
					children: [
						{
							type: "checkbox",
							id: "urlcheckbox",
							style: "margin-top:5px; display:none;",
							label: editor.lang.common.url + ":"
						},
						{
							type: "text",
							id: "url",
							label: editor.lang.common.url + ":",
							onChange: function () { imagePreview("url"); }
						}
					]
				},
				{
					type: "hbox",
					widths: ["70px"],
					children: [
						{
							type: "checkbox",
							id: "altcheckbox",
							style: "margin: 2.5px 0 2.5px 0",
							label: editor.lang.base64image.altCheckbox,
							default: "checked"
						}
					]
				},
				{
					type: "html",
					id: "preview",
					html: new CKEDITOR.template("<div style=\"text-align:center;\"></div>").output()
				},
				{
					type: "html",
					id: "altprogress",
					html: new CKEDITOR.template("<section class='cke_alt_progress'>" +
													"<p id='infoprogress'><span></span>" +
													"<i class='alt-progress-loader'/></p>" +
												"</section>").output()
				},
				{
					type: "text",
					id: "alt",
					label: editor.lang.base64image.alt + ':',
					maxLength: altTextCharLimit
				},
				{
					type: "textarea",
					id: "alt_long_desc",
					label: "Descrição longa: (Opcional)"
				}
			];
		}
	
		function setTextForInfoProgress(text) {
			document.getElementById("infoprogress").firstChild.innerHTML = text;
		}
	
		function processAlternativeTextFromUploadedImage(imageSource, sourceType) {
			var subscriptionKey = "a4858f0502de4bf2b34686486e7c01a7";
			var uriBase = "https://eastus2.api.cognitive.microsoft.com/vision/v1.0/analyze";
			var params = {
				"visualFeatures": "Categories,Description",
				"language": "en",
			};
			var contentType = null, dataToSend = null;
			if (sourceType == 'url') {
				contentType = "application/json";
				dataToSend = '{"url": ' + '"' + imageSource + '"}';
			} else { //file
				contentType = "application/octet-stream";
				dataToSend = base64ToBlob(imageSource);
			}
			setTextForInfoProgress(infoProgressMessages.uploading)
			var loader = $(".alt-progress-loader");
			loader.css("display", "inline-block");
			$.ajax({
				url: uriBase + "?" + $.param(params),
				// Request headers.
				beforeSend: function (xhrObj) {
					xhrObj.setRequestHeader("Content-Type", contentType);
					xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
				},
				processData: false,
				type: "POST",
				// Request body.
				data: dataToSend
			}).done(function (response) {
				fadeElementsAfterUpload();
				prepareToTranslate(response.description.captions[0].text);
				setTextForInfoProgress(infoProgressMessages.standard);
			}).fail(function (jqXHR, textStatus, errorThrown) {
				console.log(textStatus + ' - ' + errorThrown);
				setTextForInfoProgress(errorThrown);
			}).always(function () {
				loader.hide();
			});
		}
	
		function translateTextFromEnglishToPortuguese(text) {
			var uriBase = "https://api.microsofttranslator.com/V2/Ajax.svc/Translate";
			var params = {
				"text": text,
				"from": "en",
				"to": "pt",
				"appId": "Bearer " + translatorToken.token
			};
			$.ajax({
				url: uriBase + "?" + $.param(params),
				type: "GET",
			}).done(function (response) {
				updateAltTextInputElementAndCounter(response.substring(1, response.length-1));
			}).fail(function (jqXHR, textStatus, errorThrown) {
				console.log(textStatus + " " + errorThrown);
			});
	
		}
	
		// Prepare token if necessary then translate the text from english to portuguese
		function prepareToTranslate(text) {
			if (Date.now() > translatorToken.timeout || !translatorToken.timeout) {
				var subscriptionKey = "88ec49004da348b68563a37d5cb8c31a";
				var uriBase = "https://api.cognitive.microsoft.com/sts/v1.0/issueToken";
				$.ajax({
					url: uriBase,
					beforeSend: function (xhrObj) {
						xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
					},
					type: "POST",
					data: {},
				}).done(function (response) {
					translatorToken.token = response;
					translatorToken.timeout = Date.now() + 10 * 60 * 1000; //adds 10 minutes
					translateTextFromEnglishToPortuguese(text);
				}).fail(function (jqXHR, textStatus, errorThrown) {
					console.log(textStatus + " " + errorThrown);
				});
			}else{
				translateTextFromEnglishToPortuguese(text);
			}
		}
	
		function base64ToBlob(dataURL) {
			var parts = dataURL.split(';base64,');
			var contentType = parts[0].split(':')[1];
			var raw = window.atob(parts[1]);
			var rawLength = raw.length;
			var uInt8Array = new Uint8Array(rawLength);
			for (var i = 0; i < rawLength; ++i) {
				uInt8Array[i] = raw.charCodeAt(i);
			}
			return new Blob([uInt8Array], { type: contentType });
		}
	
		function fadeElementsAfterUpload() {
			$(".fadeAfterUpload").each(function () {
				$(this).addClass("animated fadeOutUp");
			}).delay("1000")
				.queue(function (next) {
					$(this).removeClass("animated fadeOutUp");
					next();
				}).closest(".cke_dialog_ui_vbox_child")
				.delay("1000")
				.queue(function (next) {
					$(this).hide();
					next();
				});
		}
	
		function hideUploadElements() {
			$(".fadeAfterUpload").each(function () {
				$(this).hide()
					.closest(".cke_dialog_ui_vbox_child")
					.hide();
			});
		}
	
		function resetFadeElements() {
			$(".fadeAfterUpload")
				.show()
				.closest(".cke_dialog_ui_vbox_child")
				.show();
		}
	
		function updateAltTextInputElementAndCounter(value) {
			if (value) {
				t.setValueOf("tab-source", "alt", value);
			}
			var input = t.getContentElement("tab-source", "alt").getInputElement();
			var label = input.$.labels[0].innerText;
			label = label.substring(0, label.indexOf(":"));
			input.$.labels[0].innerText = label + ": (" + t.getValueOf("tab-source", "alt").length + "/" + altTextCharLimit + ")";
		}
	
		/* Dialog */
		return {
			title: editor.lang.common.image,
			minWidth: 450,
			minHeight: 180,
			onLoad: function () {
				t = this;
				if (fsupport) {
	
					/* Get checkboxes */
					urlCB = this.getContentElement("tab-source", "urlcheckbox");
					fileCB = this.getContentElement("tab-source", "filecheckbox");
	
					/* Checkbox Events */
					urlCB.getInputElement().on("click", function () { imagePreview("url"); });
					fileCB.getInputElement().on("click", function () { imagePreview("file"); });
	
				}
	
				/* Get url input element */
				urlI = this.getContentElement("tab-source", "url");
	
				/* Get checkbox input element */
				altCB = this.getContentElement("tab-source", "altcheckbox");
	
				/* Get image preview element */
				imgPreview = this.getContentElement("tab-source", "preview");
	
				/* Constrain proportions or not */
				this.getContentElement("tab-properties", "lock").getInputElement().on("click", function () {
					if (this.getValue()) lock = true; else lock = false;
					if (lock) imageDimensions("width");
				}, this.getContentElement("tab-properties", "lock"));
	
				/* Change Attributes Events  */
				this.getContentElement("tab-properties", "width").getInputElement().on("keyup", function () { if (lock) imageDimensions("width"); });
				this.getContentElement("tab-properties", "height").getInputElement().on("keyup", function () { if (lock) imageDimensions("height"); });
				this.getContentElement("tab-properties", "vmargin").getInputElement().on("keyup", function () { integerValue(this); }, this.getContentElement("tab-properties", "vmargin"));
				this.getContentElement("tab-properties", "hmargin").getInputElement().on("keyup", function () { integerValue(this); }, this.getContentElement("tab-properties", "hmargin"));
				this.getContentElement("tab-properties", "border").getInputElement().on("keyup", function () { integerValue(this); }, this.getContentElement("tab-properties", "border"));
				this.getContentElement("tab-source", "alt").getInputElement().on("keyup", function (event) {
					updateAltTextInputElementAndCounter(event.value);
				});
			},
			onShow: function () {
	
				/* Remove preview */
				imgPreview.getElement().setHtml("");
	
				t = this, orgWidth = null, orgHeight = null, imgScal = 1, lock = true;
	
				resetFadeElements();
	
				/* selected image or null */
				selectedImg = editor.getSelection();
				if (selectedImg) selectedImg = selectedImg.getSelectedElement();
				if (!selectedImg || selectedImg.getName() !== "img") selectedImg = null;
	
				/* Set input values */
				t.setValueOf("tab-properties", "lock", lock);
				t.setValueOf("tab-properties", "vmargin", "0");
				t.setValueOf("tab-properties", "hmargin", "0");
				t.setValueOf("tab-properties", "border", "0");
				t.setValueOf("tab-properties", "align", "none");
				if (selectedImg) {
					//if selected image exists, hide upload elements
					hideUploadElements();
	
					// Load default message for infoprogress element
					setTextForInfoProgress(infoProgressMessages.standard);
	
					/* Set input values from selected image */
					if (typeof (selectedImg.getAttribute("width")) == "string") orgWidth = selectedImg.getAttribute("width");
					if (typeof (selectedImg.getAttribute("height")) == "string") orgHeight = selectedImg.getAttribute("height");
					if ((orgWidth == null || orgHeight == null) && selectedImg.$) {
						orgWidth = selectedImg.$.width;
						orgHeight = selectedImg.$.height;
					}
					if (orgWidth != null && orgHeight != null) {
						t.setValueOf("tab-properties", "width", orgWidth);
						t.setValueOf("tab-properties", "height", orgHeight);
						orgWidth = parseInt(orgWidth, 10);
						orgHeight = parseInt(orgHeight, 10);
						imgScal = 1;
						if (!isNaN(orgWidth) && !isNaN(orgHeight) && orgHeight > 0 && orgWidth > 0) imgScal = orgWidth / orgHeight;
						if (imgScal <= 0) imgScal = 1;
					}
	
					if (typeof (selectedImg.getAttribute("alt")) == "string") {
						updateAltTextInputElementAndCounter(selectedImg.getAttribute("alt"));
					}
	
					var selectedImgDescription = editor.document.findOne('figcaption#'+selectedImg.getAttribute("aria-describedby"));
					if(selectedImgDescription){
						t.setValueOf("tab-source", "alt_long_desc", selectedImgDescription.$.innerText);
					}else{
						selectedImg.removeAttribute("aria-describedby");
					}
	
					if (typeof (selectedImg.getAttribute("src")) == "string") {
						if (selectedImg.getAttribute("src").indexOf("data:") === 0) {
							imagePreview("base64");
							imagePreviewLoad(selectedImg.getAttribute("src"));
						} else {
							t.setValueOf("tab-source", "url", selectedImg.getAttribute("src"));
						}
					}
	
					if (typeof (selectedImg.getAttribute("hspace")) == "string") t.setValueOf("tab-properties", "hmargin", selectedImg.getAttribute("hspace"));
					if (typeof (selectedImg.getAttribute("vspace")) == "string") t.setValueOf("tab-properties", "vmargin", selectedImg.getAttribute("vspace"));
					if (typeof (selectedImg.getAttribute("border")) == "string") t.setValueOf("tab-properties", "border", selectedImg.getAttribute("border"));
					if (typeof (selectedImg.getAttribute("align")) == "string") {
						switch (selectedImg.getAttribute("align")) {
							case "top":
							case "text-top":
								t.setValueOf("tab-properties", "align", "top");
								break;
							case "baseline":
							case "bottom":
							case "text-bottom":
								t.setValueOf("tab-properties", "align", "bottom");
								break;
							case "left":
								t.setValueOf("tab-properties", "align", "left");
								break;
							case "right":
								t.setValueOf("tab-properties", "align", "right");
								break;
						}
					}
					t.selectPage("tab-source");
				} else {
					resetFadeElements();
					setTextForInfoProgress(infoProgressMessages.empty);
					updateAltTextInputElementAndCounter();
				}
			},
			onOk: function () {
	
				/* Get image source */
				var src = "";
				try { src = CKEDITOR.document.getById(editor.id + "previewimage").$.src; } catch (e) { src = ""; }
				if (typeof (src) != "string" || src == null || src === "") return;
	
				/* selected image or new image */
				if (selectedImg) var newImg = selectedImg; else var newImg = editor.document.createElement("img");
				newImg.setAttribute("src", src);
				src = null;
	
				/* Set attributes */
				newImg.setAttribute("alt", t.getValueOf("tab-source", "alt").replace(/^\s+/, "").replace(/\s+$/, ""));
				var attr = {
					"width": ["width", "width:#;", "integer", 1],
					"height": ["height", "height:#;", "integer", 1],
					"vmargin": ["vspace", "margin-top:#;margin-bottom:#;", "integer", 0],
					"hmargin": ["hspace", "margin-left:#;margin-right:#;", "integer", 0],
					"align": ["align", ""],
					"border": ["border", "border:# solid black;", "integer", 0]
				}, css = [], value, cssvalue, attrvalue, k;
				for (k in attr) {
	
					value = t.getValueOf("tab-properties", k);
					attrvalue = value;
					cssvalue = value;
					unit = "px";
	
					if (k == "align") {
						switch (value) {
							case "top":
							case "bottom":
								attr[k][1] = "vertical-align:#;";
								break;
							case "left":
							case "right":
								attr[k][1] = "float:#;";
								break;
							default:
								value = null;
								break;
						}
					}
	
					if (attr[k][2] == "integer") {
						if (value.indexOf("%") >= 0) unit = "%";
						value = parseInt(value, 10);
						if (isNaN(value)) value = null; else if (value < attr[k][3]) value = null;
						if (value != null) {
							if (unit == "%") {
								attrvalue = value + "%";
								cssvalue = value + "%";
							} else {
								attrvalue = value;
								cssvalue = value + "px";
							}
						}
					}
	
					if (value != null) {
						newImg.setAttribute(attr[k][0], attrvalue);
						css.push(attr[k][1].replace(/#/g, cssvalue));
					}
	
				}
				if (css.length > 0) newImg.setAttribute("style", css.join(""));			
	
				var description = null;
				var selectedImgDescription = editor.document.findOne('figcaption#'+newImg.getAttribute("aria-describedby"));
				if(t.getValueOf("tab-source", "alt_long_desc").length > 0){				
					var descriptionId = null;
					if(selectedImgDescription){
						descriptionId = selectedImgDescription.getAttribute("id");
						description = selectedImgDescription;
					}else{
						descriptionId = 'longdesc_'+Date.now().toString(16);
						description = new CKEDITOR.dom.element("figcaption");
					}
					description.setAttribute("id", descriptionId)
							   .setStyle("text-align","justify")
							   .setHtml(t.getValueOf("tab-source", "alt_long_desc"));
					newImg.setAttribute("aria-describedby", descriptionId);
				}else{
					if(selectedImgDescription) {
						selectedImgDescription.remove();
						newImg.removeAttribute("aria-describedby");
					}
				}
	
				/* Insert new image */
				if(!selectedImg){
					var figure = new CKEDITOR.dom.element("figure");
					figure.setAttribute("role","group").append(newImg);
					editor.insertElement(figure);
				} 
				if(description) description.insertAfter(newImg);
	
				/* Resize image */
				if (editor.plugins.imageresize) editor.plugins.imageresize.resize(editor, newImg, 800, 800);
			},
	
			/* Dialog form */
			contents: [
				{
					id: "tab-source",
					label: editor.lang.common.generalTab,
					elements: sourceElements
				},
				{
					id: "tab-properties",
					label: editor.lang.common.advancedTab,
					elements: [
						{
							type: 'hbox',
							widths: ["15%", "15%", "70%"],
							children: [
								{
									type: "text",
									width: "45px",
									id: "width",
									label: editor.lang.common.width
								},
								{
									type: "text",
									width: "45px",
									id: "height",
									label: editor.lang.common.height
								},
								{
									type: "checkbox",
									id: "lock",
									label: editor.lang.base64image.lockRatio,
									style: "margin-top:18px;"
								}
							]
						},
						{
							type: 'hbox',
							widths: ["23%", "30%", "30%", "17%"],
							style: "margin-top:10px;",
							children: [
								{
									type: "select",
									id: "align",
									label: editor.lang.common.align,
									items: [
										[editor.lang.common.notSet, "none"],
										[editor.lang.common.alignTop, "top"],
										[editor.lang.common.alignBottom, "bottom"],
										[editor.lang.common.alignLeft, "left"],
										[editor.lang.common.alignRight, "right"]
									]
								},
								{
									type: "text",
									width: "45px",
									id: "vmargin",
									label: editor.lang.base64image.vSpace
								},
								{
									type: "text",
									width: "45px",
									id: "hmargin",
									label: editor.lang.base64image.hSpace
								},
								{
									type: "text",
									width: "45px",
									id: "border",
									label: editor.lang.base64image.border
								}
							]
						}
					]
				}
			]
		};
	});	