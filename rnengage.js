let API_URL = 'http://api.local.retailninja.co/v1/';
let engager = {
    access_token: "",
    distId: "_rnEDistId",
    callback: "",
    init: function (access_token, callback) {
        this.access_token = access_token;
        this.callback = callback;
    },
    track: function (event, properties = {}) {

        if (this.access_token === "") {
            return this._error("Initialised Failed: Access Token Required.");
        }

        let data = JSON.stringify({
            'event': event,
            'event_time': new Date().getTime(),
            'properties': properties,
            'distinct_id': this._getDistId(),
        });

        this._call(this,'event/track', 'POST', data, function (obj, res) {
            let response = JSON.parse(res.response );
            let callbackRes = '';
            if(res.status === 200 && response.distinct_id !== ''){
                obj._setDistId(response.distinct_id);
                callbackRes =  obj._success("event/track api succeeded! " + response.message + " |distinct_id: " + response.distinct_id);
            }else {
                callbackRes = obj._error("event/track api failed! " + (response.message !== '' ? "error: "+response.message : ''));
            }

            if(obj.callback){
                obj.callback(callbackRes);
            }else {
                return callbackRes;
            }
        });

    },
    update: function (metadata = {}) {

        if (this.access_token === "") {
            return this._error("Initialised Failed: Access Token Required.");
        }

        let data = JSON.stringify({
            'metadata': metadata,
            'distinct_id': this._getDistId(),
        });

        this._call(this,'user-meta/update', 'POST', data, function (obj, res) {

            let response = JSON.parse(res.response );
            let callbackRes = '';
            if(res.status === 200 && response.distinct_id !== ''){
                obj._setDistId(response.distinct_id);
                callbackRes = obj._success("user-meta/update api succeeded! " + response.message + " |distinct_id: " + response.distinct_id);

            }else {
                callbackRes = obj._error("user-meta/update api failed! " + (response.message !== '' ? "error: "+response.message : ''));
            }

            if(obj.callback){
                obj.callback(callbackRes);
            }else {
                return callbackRes;
            }

        });

    },
    _call: function (obj, endpoints, method, data, cb) {

        let url = API_URL + endpoints;

        let xhr = new XMLHttpRequest();

        xhr.onload = function() {
            cb(obj, {'status': xhr.status, 'response': xhr.responseText});
        },
            xhr.onerror = function() {
                cb(obj, {'status': xhr.status, 'response': {}});
            }

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
        return {'success': true, 'message': message};
    },
    _error: function (message) {
        return {'success': false, 'message': message};
    }

};