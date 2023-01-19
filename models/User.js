class User {
//criei classe user, posso usar ela milhares de vezes.

    //passei tudo oq quero pegar:
    constructor(name, gender, birth, country, email, password, photo, admin){

        this._id;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;

        //precisa de tratamento diferente
        this._register = new Date();

    }

    get id(){
        return this._id;
    }

    get register(){
        return this._register;
    }

    get name(){
        return this._name;
    }

    get gender() {
        return this._gender;
    }

    get birth() {
        return this._birth;
    }

    get country() {
        return this._country;
    }

    get email() {
        return this._email;
    }

    get photo() {
        return this._photo;
    }

    get password() {
        return this._password;
    }

    get admin() {
        return this._admin;
    }

    set photo(value){
        this._photo = value;
    }

    //carrega em json
    loadFromJSON(json){

        //todos os campos em json
        for (let name in json){
            
            //nome do campo
            switch(name){

                //for = register
                case '_register':

                    //pego o campo e atribuo a ele o valor de data
                    this[name] = new Date(json[name]);

                break;

                default:
                    //se não for campo de data, atribuo valores normais.
                    this[name] = json[name];

            }
            

        }

    }

    //pego ús do histórico
    static getUsersStorage() {

        //tenho meu array com os ús criados
        let users = [];

        //pego no histórico os usuário
        if (localStorage.getItem("users")) {

            //transformo em obj
            users = JSON.parse(localStorage.getItem("users"));

        }

        //retorno eles
        return users;

    }

    //método po novo id
    getNewID(){

        //transformo o id do usuário no histórico em inteiro
        let usersID = parseInt(localStorage.getItem("usersID"));

        //se nao tiver id maior q 0, atribuo 0
        if (!usersID > 0) usersID = 0;

        //e add +1
        usersID++;

        localStorage.setItem("usersID", usersID);

        //retorno id do ús
        return usersID;

    }

    //método p salvar ús
    save(){

        //pego meus ús criados
        let users = User.getUsersStorage();
    
        //se o id deles for maior que 0
        if (this.id > 0) {
            
            users.map(u=>{

                if (u._id == this.id) {

                    Object.assign(u, this);

                }

                return u;

            });

        } else {

            this._id = this.getNewID();

            users.push(this);

        }

        localStorage.setItem("users", JSON.stringify(users));

    }

    remove(){

        let users = User.getUsersStorage();

        users.forEach((userData, index)=>{

            if (this._id == userData._id) {

                users.splice(index, 1);

            }

        });

        localStorage.setItem("users", JSON.stringify(users));

    }

}