/*
 * Created by ALL-INKL.COM - Neue Medien Muennich - 04. Feb 2014
 * Licensed under the terms of GPL, LGPL and MPL licenses.
 */

// Global Constant needed to share links with chatbot configuration
var IMAGE_CATEGORY_LINKS = {
	object: '<a href="/editor/recomendacoes/imagem#imagens-informativas-exemplo-objetos" target="_blank">Clique aqui e veja dicas sobre como descrever objetos</a>',
	animal: '<a href="/editor/recomendacoes/imagem#imagens-informativas-exemplo-animais" target="_blank">Clique aqui e veja dicas sobre como descrever animais</a>',
	text: '<a href="/editor/recomendacoes/imagem#imagens-texto" target="_blank">Clique aqui e veja dicas sobre como descrever imagens de texto</a>',
	text_cartoon: '<a href="/editor/recomendacoes/imagem#imagens-texto-exemplo-cartuns-charges" target="_blank">Clique aqui e veja dicas sobre como descrever charges e cartuns</a>',
	text_comics: '<a href="/editor/recomendacoes/imagem#imagens-texto-exemplo-quadros" target="_blank">Clique aqui e veja dicas sobre como descrever tiras cômicas</a>',
	text_table: '<a href="/editor/recomendacoes/imagem#imagens-texto-exemplo-tabelas" target="_blank">Clique aqui e veja dicas sobre como descrever tabelas</a>',
	food: '<a href="/editor/recomendacoes/imagem#imagens-informativas-exemplo-alimentos" target="_blank">Clique aqui e veja dicas sobre como descrever alimentos</a>',
	people: '<a href="/editor/recomendacoes/imagem#imagens-informativas-exemplo-pessoas" target="_blank">Clique aqui e veja dicas sobre como descrever pessoas</a>',
	outdoor: '<a href="/editor/recomendacoes/imagem#imagens-informativas-exemplo-construcoes" target="_blank">Clique aqui e veja dicas sobre como descrever imagens ao ar livre</a>',
	abstract_map: '<a href="/editor/recomendacoes/imagem#imagens-complexas-exemplo-mapas" target="_blank">Clique aqui e veja dicas sobre como descrever mapas</a>',
	abstract_diagram: '<a href="/editor/recomendacoes/imagem#imagens-complexas-exemplo-diagramas" target="_blank">Clique aqui e veja dicas sobre como descrever diagramas</a>'
}

CKEDITOR.dialog.add("base64imageDialog", function (editor) {
	
		var t = null,
			selectedImg = null,
			orgWidth = null, orgHeight = null,
			imgPreview = null, urlCB = null, urlI = null, fileCB = null, imgScal = 1, lock = true, altCB = null,
			altTextCharLimit = 100;
	
		var infoProgressMessages = {
			empty: "",
			standard: "Gostaria de melhorar a descrição inicial gerada? </br>",
			help: "O-oh... Não foi possível gerar uma descrição inicial para essa imagem. </br>",
			uploading: "Tentando gerar texto alternativo para a imagem... Aguarde um instante.",
			description: "A descrição inicial gerada para essa imagem foi: </br>",
			editing: "Gostaria de melhorar a descrição desta imagem? </br>"+ 
			"<a href=\'/editor/recomendacoes/imagem\' target=\'_blank\'>Clique aqui e veja algumas dicas e recomendações para descrições de imagens</a>",
			error: "Houve um erro ao obter a descrição da imagem.",
			helpChatbot: "Gostaria de ver dicas para a descrição de sua imagem? </br> Para começar, clique no ícone de chat no canto inferior direito.",
			helpNoCategory: "<a href=\'/editor/recomendacoes/imagem\' target=\'_blank\'>Clique aqui e veja algumas dicas e recomendações para descrições de imagens</a>",
			standardCategoryPattern: 'Clique no(s) link(s) abaixo e veja dicas sobre como descrever imagens de: <br/>',
			byCategory: function(category){return imageCategoryMapping.get(category)}
		}
		
		var imageCategoryMapping = new Map([
			['food_',IMAGE_CATEGORY_LINKS.food],
			['food_bread',IMAGE_CATEGORY_LINKS.food],
			['food_grilled',IMAGE_CATEGORY_LINKS.food],
			['food_pisa',IMAGE_CATEGORY_LINKS.food],
			['food_fastfood',IMAGE_CATEGORY_LINKS.food],
			['food_market',IMAGE_CATEGORY_LINKS.food],

			['trans_',IMAGE_CATEGORY_LINKS.object],
			['trans_car',IMAGE_CATEGORY_LINKS.object],
			['trans_bus',IMAGE_CATEGORY_LINKS.object],
			['trans_trainstation',IMAGE_CATEGORY_LINKS.object],
			['trans_bicycle',IMAGE_CATEGORY_LINKS.object],

			['drink_',IMAGE_CATEGORY_LINKS.food],
			['drink_drink',IMAGE_CATEGORY_LINKS.food],
			['drink_can',IMAGE_CATEGORY_LINKS.food],

			['object_', IMAGE_CATEGORY_LINKS.object],
			['object_screen', IMAGE_CATEGORY_LINKS.object],
			['object_sculpture', IMAGE_CATEGORY_LINKS.object],

			['animal_', IMAGE_CATEGORY_LINKS.animal],
			['animal_cat', IMAGE_CATEGORY_LINKS.animal],
			['animal_bird', IMAGE_CATEGORY_LINKS.animal],
			['animal_panda', IMAGE_CATEGORY_LINKS.animal],
			['animal_dog', IMAGE_CATEGORY_LINKS.animal],
			['animal_horse', IMAGE_CATEGORY_LINKS.animal],

			['text_',undefined],
			['text_mag',undefined],
			['text_menu',undefined],
			['text_text',undefined],
			['text_sign',undefined],
			['text_map',IMAGE_CATEGORY_LINKS.abstract_map],

			['plant_', IMAGE_CATEGORY_LINKS.outdoor],
			['plant_tree',IMAGE_CATEGORY_LINKS.outdoor],
			['plant_branches',IMAGE_CATEGORY_LINKS.outdoor],
			['plant_flower',IMAGE_CATEGORY_LINKS.outdoor],
			['plant_leave',IMAGE_CATEGORY_LINKS.outdoor],

			['people_',IMAGE_CATEGORY_LINKS.people],
			['people_crowd',IMAGE_CATEGORY_LINKS.people],
			['people_young',IMAGE_CATEGORY_LINKS.people],
			['people_baby',IMAGE_CATEGORY_LINKS.people],
			['people_tattoo',IMAGE_CATEGORY_LINKS.people],
			['people_people',IMAGE_CATEGORY_LINKS.people],
			['people_many',IMAGE_CATEGORY_LINKS.people],
			['people_swimming',IMAGE_CATEGORY_LINKS.people],
			['people_group',IMAGE_CATEGORY_LINKS.people],
			['people_show',IMAGE_CATEGORY_LINKS.people],
			['people_hand',IMAGE_CATEGORY_LINKS.people],
			['people_portrait',IMAGE_CATEGORY_LINKS.people],

			['building_',IMAGE_CATEGORY_LINKS.outdoor],
			['building_doorwindow',IMAGE_CATEGORY_LINKS.outdoor],
			['building_stair',IMAGE_CATEGORY_LINKS.outdoor],
			['building_corner',IMAGE_CATEGORY_LINKS.outdoor],
			['building_pillar',IMAGE_CATEGORY_LINKS.outdoor],
			['building_street',IMAGE_CATEGORY_LINKS.outdoor],
			['building_arch',IMAGE_CATEGORY_LINKS.outdoor],
			['building_brickwall',IMAGE_CATEGORY_LINKS.outdoor],
			['building_church',IMAGE_CATEGORY_LINKS.outdoor],

			['abstract_',undefined],
			['abstract_net',undefined],
			['abstract_nonphoto',undefined],
			['abstract_rect',undefined],
			['abstract_shape',undefined],
			['abstract_texture',undefined],

			['others_',undefined],

			['indoor_',IMAGE_CATEGORY_LINKS.outdoor],
			['indoor_venue',IMAGE_CATEGORY_LINKS.outdoor],
			['indoor_marketstore',IMAGE_CATEGORY_LINKS.outdoor],
			['indoor_storewindow',IMAGE_CATEGORY_LINKS.outdoor],
			['indoor_room',IMAGE_CATEGORY_LINKS.outdoor],
			['indoor_churchwindow',IMAGE_CATEGORY_LINKS.outdoor],
			['indoor_court',IMAGE_CATEGORY_LINKS.outdoor],

			['dark_',IMAGE_CATEGORY_LINKS.outdoor],
			['dark_fire',IMAGE_CATEGORY_LINKS.outdoor],
			['dark_fireworks',IMAGE_CATEGORY_LINKS.outdoor],
			['dark_ligthindark',IMAGE_CATEGORY_LINKS.outdoor],

			['sky_',IMAGE_CATEGORY_LINKS.outdoor],
			['sky_rainbow',IMAGE_CATEGORY_LINKS.outdoor],
			['sky_object',IMAGE_CATEGORY_LINKS.outdoor],
			['sky_cloud',IMAGE_CATEGORY_LINKS.outdoor],
			['sky_sun',IMAGE_CATEGORY_LINKS.outdoor],

			['outdoor_',IMAGE_CATEGORY_LINKS.outdoor],
			['outdoor_field',IMAGE_CATEGORY_LINKS.outdoor],
			['outdoor_house',IMAGE_CATEGORY_LINKS.outdoor],
			['outdoor_stonerock',IMAGE_CATEGORY_LINKS.outdoor],
			['outdoor_swimmingpool',IMAGE_CATEGORY_LINKS.outdoor],
			['outdoor_waterside',IMAGE_CATEGORY_LINKS.outdoor],
			['outdoor_street',IMAGE_CATEGORY_LINKS.outdoor],
			['outdoor_oceanbeach',IMAGE_CATEGORY_LINKS.outdoor],
			['outdoor_grass',IMAGE_CATEGORY_LINKS.outdoor],
			['outdoor_road',IMAGE_CATEGORY_LINKS.outdoor],
			['outdoor_city',IMAGE_CATEGORY_LINKS.outdoor],
			['outdoor_water',IMAGE_CATEGORY_LINKS.outdoor],
			['outdoor_mountain',IMAGE_CATEGORY_LINKS.outdoor],
			['outdoor_playground',IMAGE_CATEGORY_LINKS.outdoor],
			['outdoor_railway',IMAGE_CATEGORY_LINKS.outdoor]
		]);
	
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
						setTextForInfoProgress(infoProgressMessages.helpChatbot);		
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
								setTextForInfoProgress(infoProgressMessages.helpChatbot);
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
					className: "fadeAfterUpload hidden",
					children: [
						{
							type: "checkbox",
							id: "altcheckbox",
							style: "margin: 2.5px 0 2.5px 0",
							label: editor.lang.base64image.altCheckbox,
							'default': ""
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
				// {
				// 	type: "html",
				// 	id: "chatbot",					
				// 	html: new CKEDITOR.template(
				// 		'<div id="chatbot_wrapper">'+
				// 			'<label for="chatBot">Histórico de mensagens</label>'+
				// 			'<div id="chatBot">'+
				// 				'<div id="chatBotThinkingIndicator"></div>'+								
				// 				'<div id="chatBotHistory"></div>'+
				// 			'</div>'+
				// 			'<div id="chatBotInput">'+						
				// 				'</br>'+	
				// 				'<div class="input-group">'+
				// 					'<span class="input-group-addon" id="addon">'+
				// 						'<a tabindex="0" id="popoverImageCategory" data-toggle="popover" title="Ajuda sobre categorias de imagens" role="button"'+ 
				// 						'data-content="Algumas categorias que podem te ajudar: animal, comida, bebida, pessoas, construções, natureza, charge, cartum, tira cômica, quadrinhos, tabela, mapa, diagrama..."'+
				// 						'data-container="#popoverImageCategory" data-html="true">'+
				// 							'<i class="fa fa-question-circle fa-lg" aria-hidden="true"'+
				// 							'style="font: normal normal normal 14px/1 FontAwesome !important;'+
				// 							'font-size: inherit !important; cursor:pointer;"></i>'+
				// 						'</a>'+
				// 					'</span>'+						  							
				// 					'<input id="humanInput" type="text" class="cke_dialog_ui_input_text form-control"'+ 
				// 					'placeholder="Digite palavras que identifiquem a categoria dessa imagem"/>'+
				// 					'<span class="input-group-btn">'+
				// 						'<button id="btnChatBotInputHumanText" class="btn" type="button"><strong>Enviar</strong></button>'+
				// 				  	'</span>'+
				// 				'</div>'+								
				// 				'<label class="cke_dialog_ui_labeled_label" for="humanInput">'+
				// 				'Na caixa de texto acima, digite algo que ajude a identificar a categoria da imagem.'+
				// 				'</label>'+
				// 			'</div>'+
				// 		'</div>'
				// 	).output()
				// },
				{
					type: "text",
					id: "alt",
					labelStyle: "font-weight: bold",
					label: editor.lang.base64image.alt + '*: (0/' + altTextCharLimit + ')',
					maxLength: altTextCharLimit,
					validate: function() {
						if ( !this.getValue() ) {
							this.getInputElement().setStyle("border-color", "#d9534f");							
							return false;
						}else{
							this.getInputElement().setStyle("border-color", "");	
							return true;
						}
					}
				},
				{
					type: "textarea",
					id: "alt_long_desc",
					label: "Descrição longa: (Opcional)"+
					'<a tabindex="0" id="labelLongDesc" data-toggle="popover" title="Descrição Longa" role="button"'+ 
					'data-content="A <strong>descrição longa</strong> pode ser utilizada quando o espaço de 100 caracteres no texto alternativo for insuficiente para descrever a imagem. Assim, a descrição longa é um elemento <strong>opcional</strong> e deve ser utilizado em conjunto com o texto alternativo. Lembrando que não deve haver redundância entre eles. <br/> <a href=\'/editor/recomendacoes/imagem\' style=\'color:blue;text-decoration:underline;\' target=\'_blank\'>Clique aqui e veja algumas dicas e </br> recomendações para descrições de imagens</a>"'+
					'data-container="#labelLongDesc" data-html="true">'+													
						'<i class="fa fa-question-circle" aria-hidden="true"'+ 
						'style="font: normal normal normal 14px/1 FontAwesome !important; font-size: inherit !important;'+
						'margin-left:5px; cursor:pointer;"></i>'+
					'</a>'
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
							'default': "checked"
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
					labelStyle: "font-weight: bold",
					label: editor.lang.base64image.alt + '*: (0/' + altTextCharLimit + ')',
					maxLength: altTextCharLimit,
					validate: function() {
						if ( !this.getValue() ) {
							this.getInputElement().setStyle("border-color", "#d9534f");
							console.log(this.getInputElement());													
							return false;
						}else{
							this.getInputElement().setStyle("border-color", "");	
							return true;
						}
					}
				},
				{
					type: "textarea",
					id: "alt_long_desc",
					label: "Descrição longa: (Opcional)"+
					'<a tabindex="0" id="labelLongDesc" data-toggle="popover" title="Descrição Longa" role="button"'+ 
					'data-content="A <strong>descrição longa</strong> pode ser utilizada quando o espaço de 100 caracteres no texto alternativo for insuficiente para descrever a imagem. Assim, a descrição longa é um elemento <strong>opcional</strong> e deve ser utilizado em conjunto com o texto alternativo. Lembrando que não deve haver redundância entre eles. <br/> <a href=\'/editor/recomendacoes/imagem\' style=\'color:blue;text-decoration:underline;\' target=\'_blank\'>Clique aqui e veja algumas dicas e </br> recomendações para descrições de imagens</a>"'+
					'data-container="#labelLongDesc" data-html="true">'+													
						'<i class="fa fa-question-circle" aria-hidden="true"'+ 
						'style="font: normal normal normal 14px/1 FontAwesome !important; font-size: inherit !important;'+
						'margin-left:5px; cursor:pointer;"></i>'+
					'</a>'
				}
			];
		}

		function setTextForInfoProgress(text, append) {
			var element = document.getElementById("infoprogress").firstChild;			
			if(append){
				element.innerHTML += text;
			}else{
				element.innerHTML = text;
			}
		}
	
		function processAlternativeTextFromUploadedImage(imageSource, sourceType) {
			var subscriptionKey = "a4858f0502de4bf2b34686486e7c01a7";
			var uriBase = "https://eastus2.api.cognitive.microsoft.com/vision/v1.0/analyze";
			var params = {
				"visualFeatures": "Categories,Description",
				"language": "en"
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
			loader.show();
			setTextForInfoProgress(infoProgressMessages.uploading);
			//CHATBOT.addChatEntry(infoProgressMessages.uploading, 'bot');		
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
				var confidence = getImageDescriptionConfidence(response.description);
				if(confidence >= 0.75){
					//Good confidence on description, probably an useful one.
					// console.log("Good confidence on description, probably an useful one. "+confidence);
					//console.log(response);
					prepareToTranslate(response);															
				}else{
					//Not so good confidence, try to help the user on describing the image.					
					// console.log("Not so good... "+confidence);
					//console.log(response);
					setTextForInfoProgress(infoProgressMessages.help);
					findCategoryInfo(response);
				}							
			}).fail(function (jqXHR, textStatus, errorThrown) {
				setTextForInfoProgress(infoProgressMessages.error + ' ('+errorThrown+')');
			}).always(function () {
				loader.hide();
			});
		}

		function getImageDescriptionConfidence(description){
			return description.captions[0].confidence;
		}		
	
		// Prepare token if necessary then translate the text from english to portuguese
		function prepareToTranslate(response) {
			var text = response.description.captions[0].text;
			var descriptionResponse = response;
			if (Date.now() > translatorToken.timeout || !translatorToken.timeout) {
				var subscriptionKey = "88ec49004da348b68563a37d5cb8c31a";
				var uriBase = "https://api.cognitive.microsoft.com/sts/v1.0/issueToken";
				$.ajax({
					url: uriBase,
					beforeSend: function (xhrObj) {
						xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
					},
					type: "POST",
					data: {}
				}).done(function (response) {
					translatorToken.token = response;
					translatorToken.timeout = Date.now() + 10 * 60 * 1000; //adds 10 minutes
					translateTextFromEnglishToPortuguese(text, descriptionResponse);
				});
			}else{
				translateTextFromEnglishToPortuguese(text, descriptionResponse);
			}
		}

		// translate text and after that calls findCategory method
		function translateTextFromEnglishToPortuguese(text, descriptionResponse) {
			var uriBase = "https://api.microsofttranslator.com/V2/Ajax.svc/Translate";
			var params = {
				"text": text,
				"from": "en",
				"to": "pt",
				"appId": "Bearer " + translatorToken.token
			};
			$.ajax({
				url: uriBase + "?" + $.param(params),
				type: "GET"
			}).done(function (response) {				
				//updateAltTextInputElementAndCounter(response.substring(1, response.length-1));
				setTextForInfoProgress(infoProgressMessages.description+' '+response+'</br>'+infoProgressMessages.standard);
				//CHATBOT.addChatEntry(infoProgressMessages.description+' '+response+'</br>'+infoProgressMessages.standard, 'bot');
				findCategoryInfo(descriptionResponse);									
			});	
		}		

		/**
		 * Verify if there are categories from the response
		 * and show a link to the appropriated section on help page.
		 * Otherwise, interact to obtain the appropriated category.
		 * @param {*} response 
		 */
		function findCategoryInfo(response){			
			if(response.categories){
				var category = getMostRelevantCategoryFromImage(response.categories);
				var categoryMessage = infoProgressMessages.byCategory(category.name);
				if(categoryMessage){ //category message is defined					
					setTextForInfoProgress(categoryMessage, true);
					//CHATBOT.addChatEntry(categoryMessage, 'bot');
				}else{ //try to extract category from tags
					findCategoryInfoByTags(response.description.tags);									
				}				
			}else{	//try to extract category from tags			
				findCategoryInfoByTags(response.description.tags);		
			}
		}

		/**
		 * Verify if there are tags from response to help on finding image category.
		 * Otherwise, interact to obtain the appropriated category.
		 * @param {*} tags 
		 */
		function findCategoryInfoByTags(tags){	
			var tagsTops;
			if(tags.length>=6){
				tagsTops = tags.slice(0,6);
			}else{
				tagsTops = tags.slice(0,tags.length);
			}

			var categoriesFromTags = [];
			var textToRemove = 'Clique aqui e veja dicas sobre como descrever ';
			
			if(checkTags(tagsTops, ['map'])){ // probably an image of a map		
				categoriesFromTags.push(removeTextFromString(IMAGE_CATEGORY_LINKS.abstract_map, textToRemove));				
			}

			if(checkTags(tagsTops, ['animal'])){				
				categoriesFromTags.push(removeTextFromString(IMAGE_CATEGORY_LINKS.animal, textToRemove));							
			}

			if(checkTags(tagsTops, 
				['tree','plant','outdoor','wood','forest','water','mountain',
				 'nature','waterfall','rock','grass','building','house','church'])){
					categoriesFromTags.push(
						removeTextFromString(IMAGE_CATEGORY_LINKS.outdoor, textToRemove));
			}

			if(checkTags(tagsTops, ['drawing','text','white','book'])){				
				categoriesFromTags.push(removeTextFromString(IMAGE_CATEGORY_LINKS.text,textToRemove));
			}

			if(categoriesFromTags.length == 0){				
				setTextForInfoProgress(infoProgressMessages.helpNoCategory, true);
			}else{
				setTextForInfoProgress(infoProgressMessages.standardCategoryPattern, true);				
				for(var i=0; i<categoriesFromTags.length; i++){
					if(i == categoriesFromTags.length-1){
						setTextForInfoProgress(categoriesFromTags[i]+'.', true);
					}else{
						setTextForInfoProgress(categoriesFromTags[i]+', ', true);
					}					
				}
			}			
		}

		function removeTextFromString(original, toRemove){
			return original.replace(toRemove,'');
		}

		function getMostRelevantCategoryFromImage(categories){
			var relevant = categories[0];
			for(var ci = 1; ci < categories.length; ci++){
				if(relevant.score < categories[ci].score){
					relevant = categories[ci];
				}
			}
			return relevant;
		}

		// function activateChatBotHelp(){
		// 	//CHATBOT.addChatEntry(infoProgressMessages.helpChatbot, 'bot');
		// 	setTextForInfoProgress(infoProgressMessages.helpChatbot, true);
		// 	showChatBotInput();
		// }

		function checkTags(tags,array){
			return array.some(function(tag){				
				return tags.indexOf(tag) >= 0;
			})
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

		function hideAlternativeTextElements(dialog){
			dialog.getContentElement("tab-source","alt").getElement().hide();
			dialog.getContentElement("tab-source","alt_long_desc").getElement().hide();
		}

		function showAlternativeTextElements(dialog){
			dialog.getContentElement("tab-source","alt").getElement().show();
			dialog.getContentElement("tab-source","alt_long_desc").getElement().show();
		}

		// function hideChatBotInput(){
		// 	$("#chatBotInput").hide();
		// }

		// function showChatBotInput(){
		// 	$("#chatBotInput").show();
		// }
	
		function updateAltTextInputElementAndCounter(value) {
			if (value) {
				t.setValueOf("tab-source", "alt", value);				
			}
			var input = t.getContentElement("tab-source", "alt").getInputElement();
			var label = document.querySelector('label[for="'+input.$.id+'"]');
			var labelText = label.innerText.substring(0, label.innerText.indexOf(":"));
			label.innerHTML = labelText + ": (" + t.getValueOf("tab-source", "alt").length + "/" + altTextCharLimit + ")"
			+ '<a tabindex="0" id="labelAlt" data-toggle="popover" title="Texto Alternativo" role="button"'+ 
			'data-content="O <strong>texto alternativo</strong> é um atributo <strong>obrigatório</strong> em imagens que serve para se adicionar uma descrição breve, de até 100 caracteres, sobre ela. <br/> <a href=\'/editor/recomendacoes/imagem\' style=\'color:blue;text-decoration:underline;\' target=\'_blank\'>Clique aqui e veja algumas dicas e </br> recomendações para descrições de imagens</a>"'+
			'data-container="#labelAlt" data-html="true">'+													
				'<i class="fa fa-question-circle" aria-hidden="true"'+ 
				'style="font: normal normal normal 14px/1 FontAwesome !important; font-size: inherit !important;'+
				'margin-left:5px; cursor:pointer;"></i>'+
			'</a>';
		}
	
		/* Dialog */
		return {
			title: editor.lang.common.image,
			minWidth: 460,
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
				
				// Event listener to chatbot input button
				// $("#btnChatBotInputHumanText").on('click', function(){
				// 	var input = $("#humanInput").val();
				// 	if(input.length > 0){
				// 		CHATBOT.addChatEntry(input,'human');
				// 		CHATBOT.react(input);
				// 	}					
				// });

				/* Hidden chatBot input elements */
				//hideChatBotInput();	
				/* Load chatbot configuration */
				//CKEDITOR.scriptLoader.load(CKEDITOR.getUrl('plugins/base64image/libs/js/chatbot.config.js'));
			},
			onShow: function () {
	
				/* Remove preview */
				imgPreview.getElement().setHtml("");

				/* Cleans chatbot history */
				//$("#chatBotHistory").html("");
	
				t = this, orgWidth = null, orgHeight = null, imgScal = 1, lock = true;
	
				resetFadeElements();	
				
				/* Hidden chatBot input elements */
				//hideChatBotInput();	
	
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

					setTextForInfoProgress(infoProgressMessages.editing);
	
					//CHATBOT.addChatEntry(infoProgressMessages.editing,'bot');					
	
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
			onCancel: function(){
				t.getContentElement("tab-source", "alt").getInputElement().setStyle("border-color","");
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