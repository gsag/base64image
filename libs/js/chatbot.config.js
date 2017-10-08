var config = {
    botName: 'Resposta:',
    humanName: 'Você disse:',
    inputs: '#humanInput',
    inputCapabilityListing: true,
    engines: [chatbotEngine()],
    addChatEntryCallback: function(entryDiv, text, origin) {
        //Displays only one response at a time
        var history = $("#chatBotHistory");
        if(history.children().length > 2){
            history.children()[2].remove();
        }
    }
};
ChatBot.init(config);

function chatbotEngine() {    
    var capabilities = [
        "'hip hip'",
        "'hi'"
    ]
    return {
        react: function (query) {
            
            var answer = '';
            if (query == 'hip hip') {
                answer = 'hooray';
            }
            if(query == 'hi'){
                answer = 'hello';
            }
            
            ChatBot.addChatEntry(answer, "bot");
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