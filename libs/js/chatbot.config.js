(function(categoryLinks){
    'use strict';
    var config = {
        botName: 'Resposta:',
        humanName: 'Você disse:',
        inputs: '#humanInput',
        inputCapabilityListing: true,
        engines: [chatbotEngine()],
        addChatEntryCallback: function(entryDiv, text, origin) {
            var history = $("#chatBotHistory");
            if(history.children().length > 2){
                history.children()[2].remove();
            }
        }
    };
    ChatBot.init(config);
    
    function chatbotEngine() {    
        var capabilities = [            
            "'animal'",
            "'objeto'",            
            "'alimento, bebida'",
            "'pessoas'",
            "'construção, paisagem, ao ar livre, natureza'",
            "'charge, cartum'",
            "'tira cômica, quadrinho'",
            "'tabela'",
            "'mapa'",
            "'diagrama'"            
        ]
        return {
            react: function (query) {           
                ChatBot.addChatEntry(queryAnswer(query), "bot");
                ChatBot.thinking(false);
            },
            getCapabilities: function() {
                return capabilities;
            },
            getSuggestUrl: function() {
                return null;
            }
        }
    };

    function queryAnswer(query){
        var answerMap = new Map([
            ['(animal|animais|gato|felino|p[á,a]ssaro|ave|panda|urso|cavalo|c[ã,a]o|cachorro|canino|mam[í,i]fero)', categoryLinks.animal],
            ['(objeto|escultura|est[á,a]tua|tela|celular|carro|[ô,o]nibus|transporte|trem|trem|metro|avi[ã,a]o|bicicleta)', categoryLinks.object],
            ['(charge|cartum|cartun|cartoon|desenho|ilustra[ç,c][ã,a]o)', categoryLinks.text_cartoon],
            ['(tira c[ô,o]mica|tira|tirinha|hist[ó,o]ria em quadrinho|quadrinho)',categoryLinks.text_comics],
            ['(comida|p[ã,a]o|grelha\w*|\w*burg\w*|pizza|fastfood|mercado\w*|alimenta\w*|bebida)', categoryLinks.food],
            ['(pessoa|multid[ã,a]o|casal|crian[ç,c]a|beb[ê,e]|jovem|adulto|velho|idoso|tatuagem|mão|retrato)', categoryLinks.people],
            ['(constru[ç,c]|porta|janela|escada|parede|pilar|rua|arco|tijolo|muro|igreja|capela|avenida|loja|vitrine|quarto|'+
             'fog[o,u,s]|artif[í,i]cio|c[é,e]u|[í,i]ris|nuvem|sol|lua|campo|rocha|pedra|piscina|lago|praia|'+
             'estrada|rodovia|cidade|[á,a]gua|montanha|ferrovia|p[á,a]tio|[á,a]rvore|planta|flor|galho|ramo|vegeta[ç,c,l]|'+
             'madeira|bosque|parque)',categoryLinks.outdoor],
            ['tabela|dado|tabula[ç,c]',categoryLinks.text_table],
            ['(mapa|cartografia|relevo|mapeamento|continente)',categoryLinks.abstract_map],
            ['(diagrama|fluxograma|organograma|\w*grama|gr[á,a]fico)',categoryLinks.abstract_diagram]
        ]);
        for(var key of answerMap.keys()){
            if(query.match(new RegExp(key+'(.*?)', 'gi'))){
                return answerMap.get(key);
            }
        }
        return 'Desculpe, nenhuma categoria com nome relacionado foi encontrada...' +
               '<br><a href="/editor/recomendacoes/imagem" target="_blank\">'+
               'Veja algumas dicas e recomendações para descrições (link para nova página)</a>'
    }
})(IMAGE_CATEGORY_LINKS || {});