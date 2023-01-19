//crio classe pra controlar esse usuário:
class UserController {

    //passando param que indiquei lá na instância:
    constructor(formIdCreate, formIdUpdate, tableId){

        //crio "vars" p param:
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();//chamo envio de usuário p tbl
        this.onEdit();//chamo editar usuário da tbl
        this.selectAll();

    }

    //método editar usuário:
    onEdit(){

        //seleciono id do form de edição e o btn de cancelar. Add evento de click:
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{

            //p mostrar caso eu clicque em cancelar, o painel de criação.
            this.showPanelCreate();

        });

        //envio do form de atualização
        this.formUpdateEl.addEventListener("submit", event => {

            //cancela envio padrão
            event.preventDefault();

            //seleciono btn que dentro do form de atualiz. seja do tipo submit
            let btn = this.formUpdateEl.querySelector("[type=submit]");

            //digo p ficar desabilitado quando clicado, atñe o envio do form atualizado.
            btn.disabled = true;

            //pego os valores que estão dentro do form de atualização.
            let values = this.getValues(this.formUpdateEl);

            //pego form atualiz. e mudo conteudo
            let index = this.formUpdateEl.dataset.trIndex;

            //pego a tbl e nas linhas coloco o novo conteudo
            let tr = this.tableEl.rows[index];

            //transformo em obj, o usuário
            let userOld = JSON.parse(tr.dataset.user);

            //retornando exatamente a linha que quero atualizar.
            let result = Object.assign({}, userOld, values);

            //atualizo a foto, pego ela que ta dentro do form de atualiz, e pega o conteudo dessa foto
            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    //se ñ quiser mudar a foto
                    if (!values.photo) {

                        //mantes a foto antiga do ús antigo
                        result._photo = userOld._photo;
                        
                    } else {

                        //pega a nova foto e poem como novo conteudo.
                        result._photo = content;
                    }

                    //assim crio novo ús
                    let user = new User();

                    //pego ús e carrego do JSON novos resultados
                    user.loadFromJSON(result);

                    //salvo usuário atualizado
                    user.save();

                    //pego linha e add nela o usuário na linha que ele já estava.
                    this.getTr(user, tr);

                    //atualiza valores nas caixinhas verde e amarela, caso o usuário tenha se tornado ou desabilitado a opñão de administrador.
                    this.updateCount();

                    //coloca todos os campos com o valor igual ao que atualizei
                    this.formUpdateEl.reset();

                    //habilito btn de save
                    btn.disabled = false;

                    //volta p painel de criar usuário, qnd btn de salvar for clicado
                    this.showPanelCreate();

                },
                (e) => {
                    console.error(e);
                }
                //caso de erro, mostro apenas no console p ñ travar aplicação do usuário
            );

        });

    }

    //método para enviar formulário de criação de usuário
    onSubmit(){

        this.formEl.addEventListener("submit", event => {//seleciona form de criacao, quando eu enviar, ele

            event.preventDefault();//cancele o envio padrão

            let btn = this.formEl.querySelector("[type=submit]");//pega o btn que dentro do form de criacao seja do tipo enviar

            btn.disabled = true;//desabilita btn

            let values = this.getValues(this.formEl);//pego todos os valores que foram preenchidos no form

            if (!values) return false;//se n foi preenchido, retorno falso

            this.getPhoto(this.formEl).then(//pego a foto, que ta dentro do form e seu conteudo
                (content) => {
                    
                    values.photo = content;//pego foto

                    values.save();//salvo o conteudo que vem dessa foto

                    this.addLine(values);//add na linha a foto

                    this.formEl.reset();//coloco tudo no form de criacao

                    btn.disabled = false;//ativo btn

                }, 
                (e) => {//caso de erro, mostro apenas no console p ñ travar aplicação do usuário
                    console.error(e);
                }
            );

        });

    }

    //método pra pegar foto, como param o formulario:
    getPhoto(formEl){

        return new Promise((resolve, reject)=>{//prometo se der certo eu

            let fileReader = new FileReader();//método do JS pra ler arq de fotos

            let elements = [...formEl.elements].filter(item => {//percorro all elementos do form, e filtro todos os itens que esse array retorna:

                if (item.name === 'photo') {//se o nome de um desses itens for igual a photo
                    return item;//retorno a foto
                }

            });

            let file = elements[0].files[0];//pego a posicao 0 e o arq 0, ou seja (1)

            fileReader.onload = () => {//peço que quando carregar a foto

                resolve(fileReader.result);//mostre o resultado

            };

            fileReader.onerror = (e)=>{//se nao der certo mostro erro

                reject(e);

            };

            if (file) { //se usuario colocar foto
                fileReader.readAsDataURL(file);//retorno ela
            } else {
                resolve('dist/img/boxed-bg.jpg');//se ñ coloca uma padrão, pois colocar foto ñ é obrigatório.
            }

        });

    }

    //método pegar valores do formulário:
    getValues(formEl){

        let user = {};//pego meus usuários, passando um json
        let isValid = true;//crio var p dizer que é valido

        [...formEl.elements].forEach(function (field, index) {//percorro todos elementos do meu form, procurando seu campoo valor

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {//SE no array conter nome, email, senha. Procurar nesses inputs o primeiro item do campo que possui esses nomes e for MAIOR QUE -1 E o campo NÃO esteja com algo escrito

                field.parentElement.classList.add('has-error');//pega o campo, o PAI dele, no caso por ex: toda div que abrange esse imput, e coloca cor vermelha

                isValid = false;//não ñ é valido

            }

            if (field.name == "gender") {//se o campo de sexo

                if (field.checked) {//se estiver marcado

                    user[field.name] = field.value;//pega o use, e atribui o valor de marcado em qual ele escolher
                }

            } else if(field.name == "admin") {//se ñ se o campo de admin estiver marcado

                user[field.name] = field.checked;//atribui a ele o check marcado

            } else {//e o restande dos campos, atribui os valores escritos/selecionados

                user[field.name] = field.value;

            }

        });

        if (!isValid) {//se nao for valido retorna falso
            return false;
        }

        return new User(//se passou por todas atualizações, cria o usuário
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        );

    }

    //método p listar os dados do sessionStorange
    selectAll(){

        let users = User.getUsersStorage();//pegar a classe User, e pega os usuários do histórico

        users.forEach(dataUser=>{//procura entre os usuários suas infos

            let user = new User();//crio novo usuário

            user.loadFromJSON(dataUser);//pego ús, carrega os dados em JSON

            this.addLine(user);//add uma nova linha com os dados carregados de ús.

        });

    }

    //método p add linha na tbl
    addLine(dataUser) {

        let tr = this.getTr(dataUser);//pego linha com os dados do ús

        this.tableEl.appendChild(tr);//adiciono na tabela essa linha

        this.updateCount();//atualizo as caixinhas verde/amarelo

    }

    //método p pegar linha da tabela
    getTr(dataUser, tr = null){ //pego as infos do usuário, a linha começa vazia/nula

        if (tr === null) tr = document.createElement('tr');//se a linha tiver nada, então crio um elemento tr nela

        tr.dataset.user = JSON.stringify(dataUser);//add nessa linha os dados do usuário em formato string

        tr.innerHTML = `
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `;//add oq é pra por na linha

        this.addEventsTr(tr);

        return tr;

    }

    //método p add eventos no tr dos btn que tem ali, editar e excluir
    addEventsTr(tr){ //pego a linha

        tr.querySelector(".btn-delete").addEventListener("click", e => {//pego btn de exluir p quando eu clicar

            if (confirm("Deseja realmente excluir?")) {//pedir se realmente o ús quer excluir

                let user = new User();//pego o novo usuário

                user.loadFromJSON(JSON.parse(tr.dataset.user));//carrego as infos dele, trasformo p obj, toda linha, com as infos do usuário

                user.remove();//e removo ele

                tr.remove();//e removo a linha tbm

                this.updateCount();//atualizo caixinhas verde/amarelo

            }

        });

        tr.querySelector(".btn-edit").addEventListener("click", e => {//pego btn de editar, que qnd clicado

            let json = JSON.parse(tr.dataset.user);//transforma as infos do ús em json

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;//pegao o form de editar ús, e aposição que ta essa linha na tbl

            for (let name in json) {//para os nomes dos campos no json

                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");//pego todos os campos do form editar e seleciono os com nome que tem _ e troco por nada

                if (field) {//se campo

                    switch (field.type) {//tipo do campo for:
                        case 'file'://foto, continua
                            continue;
                            break;

                        case 'radio'://escolha
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");//pega form editar e atribuiu ao nome o valor indicado, escolhido, clicado
                            field.checked = true;//deixo campo marcado
                            break;

                        case 'checkbox'://caso seja check
                            field.checked = json[name];//pego o json correspondendo e deixo marcado
                            break;

                        default:
                            field.value = json[name];//se nao só atribuo o valor conforme ta no json.

                    }

                }

            }

            this.formUpdateEl.querySelector(".photo").src = json._photo;//se eu quiser atualizar a foto no form de editar, seleciono ser src como a novo foto vinda no json

            this.showPanelUpdate();//mostro painel editar


        });

    }

    //método p mostrar painel de criar usuário
    showPanelCreate(){

        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";

    }

    //método p mostrar painel de editar usuário
    showPanelUpdate() {

        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";

    }

    //método p atualizar caixinha verde e amarela:
    updateCount(){

        let numberUsers = 0;//inicio ambos com 0
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr=>{//procuro na tabela, os filhos, que são as linhas

            numberUsers++;//e add +1 sempre que add um ús no campo verde
            
            let user = JSON.parse(tr.dataset.user);//pego os dados do ús da linha

            if (user._admin) numberAdmin++;//se o usuário tiver opção admin marcada, add +1 no campo amarelo
            
        });

        //indico a qual campo estou me referindo
        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;

    }

}