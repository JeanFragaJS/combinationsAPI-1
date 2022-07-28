import VtexOrder from '../clients/client-order-by-id.js';
import mergeSort from '../services/MergeSort.js';
export default new class RewardsController {

    async store(req, res) {  //Método para receber hook config + Criar combinação de acordo com o pedido recebido
        const { OrderId, State, hookConfig } = req.body;
        if (hookConfig) //se possuir a variavel configuração, significa que o request foi somente de configuração
            return res.status(200).json({ "Config": "Successful" }); //retorna um status 200 para informar que a configuração foi bem sucedida

        if (!State) //verifica se a váriavel estado foi passada no body da requisição
            return res.status(400).json({ "error": "Bad Request" }); //envia um erro informando requisição inválida

        const { items } = await VtexOrder.fetchGetById(OrderId); //getOrderById captura informação do pedido pelo número do pedido
        const NUMBER_OF_TOP_COMBINATIONS = 3; //pegar do masterdata também?
        let { combinations, topCombinations } = await; //MasterDataget

        const addTopCombination = (obj) =>{ //método para atualizar o vetor de melhores combinacoes
            let addIndex = -1;
            for(let j= 0; j < topCombinations.length; j++){
                if(((+Object.values(Object.values(topCombinations[j])[0])[0] < +Object.keys(Object.values(obj)[0])[0]) && addIndex === -1)
                    || ( (j === (topCombinations.length - 1)) && (+Object.values(Object.values(topCombinations[j])[0])[0] === +Object.keys(Object.values(obj)[0])[0]) && addIndex === -1)){
                    addIndex = j;
                }
                if((Object.keys(obj)[0] === Object.keys(topCombinations[j])[0]) && (Object.values(Object.values(obj)[0])[0] === Object.keys(Object.values(topCombinations[j])[0])[0])){
                    const newAparritionsValue = +Object.keys(Object.values(obj)[0])[0] + +Object.values(Object.values(topCombinations[j])[0])[0];
                    topCombinations.splice(j,1);
                    return topCombinations.splice(j, 0, {[Object.keys(obj)[0]]:{[Object.values(Object.values(obj)[0])[0]] : newAparritionsValue}});
                }
            }
            if(addIndex !== -1){ 
                if(topCombinations.length === NUMBER_OF_COMBINATIONS) topCombinations.splice((NUMBER_OF_COMBINATIONS-1),1);
                return topCombinations.splice(addIndex, 0, {[Object.keys(obj)[0]]:{[Object.values(Object.values(obj)[0])[0]] : +Object.keys(Object.values(obj)[0])[0]}});
            }else if(topCombinations.length < NUMBER_OF_COMBINATIONS){
                return topCombinations.push({[Object.keys(obj)[0]]:{[Object.values(Object.values(obj)[0])[0]] : +Object.keys(Object.values(obj)[0])[0]}});
            }
        };

        if(items.length > 1){
            for(const item of items){ //percorre os items do pedido recebido (a partir daqui itemPrincipal)
                if(!combinations[item]){ //verifica se já existe combinações com o itemPrincipal
                    combinations = { //se não existir, criar o objeto para inserir as combinacoes.
                        ...combinations,
                        [item]:{
                            "combinations":[]
                        }
                    }
                }
                for(const subItem of items){ //percorre novamente os items(a partir daqui subItem) do pedido para formar as combinações, para cada item ele deve combinar com todos os outros do pedido
                    if(subItem !== item){ //verifica se o subItem a ser combinado não é o mesmo itemPrincipal
                        let isInserted = false; //variavel para saber se a combinacao existe e foi acrescentada uma aparição
                        for(let i = 0; i < combinations[item].combinations.length; i++){ //percorre a lista de combinações do itemPrincipal
                            if(Object.values(hashItem)[0] === subItem){ //verifica se existe a combinação do ItemPrincipal com o subItem
                                const newApparitionsValue = +Object.keys(combinations[item].combinations[i])[0] + 1;
                                combinations[item].combinations.push({  //se existir adiciona + 1 no número de aparições da combinação e insere no vetor de combinações
                                    [newApparitionsValue]: subItem
                                });
                                addTopCombination({[item]: {[newApparitionsValue]: subItem}}); // adiciona a combinação nos tops, somando quando ela já existir ou verificando se a nova soma é superior
                                combinations[item].combinations.splice(i, 1); //remove o número de combinações antigas(do itemPrincipal com o subItem) do vetor de combinações
                                combinations[item].combinations = mergeSort(obj[item].combinations); //Ordena novamente as combinações para a primeira combinação sempre ser a com maior número de aparições
                                isInserted = true; //informa que foi acrescentado uma aparição 
                                break;
                            }
                        }
                        if(!isInserted){
                            combinations[item].combinations.push({  //se a combinacao não existir, insere ela no fim da lista com valor de uma aparição
                                ["1"]: subItem
                            });
                            addTopCombination({[item]: {["1"]: subItem}}); //tenta adicionar no array de melhoes combinacoes
                        }
                    }
                }
            }
        }


        /*
        
            INSERIR LÓGICA PARA ALIMENTAR MASTERDATA COM NOVAS INFOS
        
        */
    }
}