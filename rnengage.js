Cookies = require('js-cookie');
let API_URL = 'http://api.retailninja.co/v1/';
let engager = {
    access_token: "",
    distId: "_rnEDistId",
    init: function (access_token) {
        this.access_token = access_token;
    },
    track: function (event, properties = {}) {

        if (this.access_token === "") {
            return this._error("Initialised Failed: Access Token Required.")
        }

        let data = JSON.stringify({
            'event': event,
            'event_time': new Date().getTime(),
            'properties': properties,
            'distinct_id': this._getDistId(),
        });

        let responseText = this._call('event/track', 'POST', data);

    },
    update: function (metadata = {}) {

        if (this.access_token === "") {
            return this._error("Initialised Failed: Access Token Required.")
        }

        let data = JSON.stringify({
            'metadata': metadata,
            'distinct_id': this._getDistId(),
        });

        this._call('user-meta/update', 'POST', data);

    },
    _call: function (endpoints, method, data) {

        let url = API_URL + endpoints;

        let xhr = new XMLHttpRequest();

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {

                let response = JSON.parse(this.responseText);

                if(this.status === '200' && response.distinct_id !== ''){
                    this._setDistId(response.distinct_id);
                    return this._success(endpoints +"api succeeded! " + response.message + " |distinct_id: " + response.distinct_id);

                }else {
                    return this._error(endpoints + "api failed! " + response.message !== '' ? "error: "+response.message : '');
                }
            }
        });

        xhr.open(method, url);
        xhr.setRequestHeader("client-secret", this.access_token);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("cache-control", "no-cache");
        xhr.send(data);
    },
    _setDistId: function (value) {
        Cookies.set(this.distId, value, {expires: 365});
    },
    _getDistId: function () {
        return Cookies.get(this.distId);
    },
    _success: function (message) {
        return {'success': true, 'message': message}
    },
    _error: function (message) {
        return {'success': false, 'message': message}
    }

};