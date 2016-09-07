function transformToAssocArray( prmstr ) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

function getSearchParameters() {
      var prmstr = window.location.search.substr(1);
      return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

AppUtils = {
    loadingsCnt: 0,
    charSet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    generateRandomId: function () {
        var me = this;
        var id = '';
        for (var i = 1; i <= 5; i++) {
            var randPos = Math.floor(Math.random() * me.charSet.length);
            id += me.charSet[randPos];
        }
        return id;
    },
    
    loadingShow: function (appConfig) {
        var me = this;
        if (me.loadingsCnt == 0) {
            appConfig.appLoading = true;
            /*angular.element('#loading-wrapper').show();
            angular.element('#loading').show();*/
        }
        me.loadingsCnt++;
    },
    loadingHide: function (appConfig) {
        var me = this;
        me.loadingsCnt--;
        if (me.loadingsCnt == 0) {
            appConfig.appLoading = false;
            /*angular.element('#loading-wrapper').hide();
            angular.element('#loading').hide();*/
        }
    },
    messagebox: function (title, content) {
        var me = this;
        me.angularServices.$mdDialog.show(
                me.angularServices.$mdDialog.alert()
                  .parent(angular.element(document.querySelector('body')))
                  .clickOutsideToClose(true)
                  .title(title)
                  .htmlContent(content)
                  .ariaLabel('შეტყობინება')
                  .ok('OK')
              );
        
        /*$("#myModalHeader").html(title);
        $("#myModalBody").html(content);
        $("#myModal").modal('show');*/
    },
    messageboxClose: function(){
        /*$("#myModalHeader").html('');
        $("#myModalBody").html('');
        $("#myModal").modal('hide');*/
    },
    catchError: function (error) {
        //alert(error);
        console.log(error);
    },
    logout: function (appConfig, cb) {
        
        var me = this;
        
        /*me.http($http,$mdDialog, appConfig, $location, 'kanccoreproxy/Default', 'process.do',{
            action: 'authentication/unregisterSession'
        },function(rs){
             if(cb){
                 cb();
             }
            $location.path("/login");
        });*/
        me.messagebox('Info', 'Under construction...');
        
    },
    checkAjaxResponse: function (appConfig, rs, urlResource) {
        var me = this;
        if (!rs.sessionValid) {
            me.logout(me.angularServices.$http, me.angularServices.$mdDialog, appConfig, me.angularServices.$location);
            return false;
        }
        if (!rs.success) {
            me.messagebox('შეცდომა','{0} <br/><span class="alert-tiny-text">{1}</span>'.format(rs.errorText, urlResource));
            return false;
        } else {
            return true;
        }
    },
    
    prepareJson4Submit: function(params){
        
        var params4Submit = angular.copy(params);
                
                angular.forEach(params4Submit, function (value1, key1) {

                        if(isDate(value1)){
                            value1 = moment(value1).format('DD MM YYYY');
                            console.log(value1);
                            params4Submit[key1] = value1;
                        }

                    });
                    
                    return params4Submit;
        
    },
    
    upload: function(appConfig, className, methodName, params, successCallback, unsuccessCallback, withoutLoading){
        var me = this;
        try {
            if(!withoutLoading){
                me.loadingShow(appConfig);
            }
            
            me.angularServices.Upload.upload({
                url: "{0}/{1}".format(className, methodName),
                data: params
            }).then(function (rs) {
                
                try {
                    var actionText = params.action? params.action: "{0}/{1}".format(className, methodName);
                    
                    if (me.checkAjaxResponse(appConfig, rs.data, actionText)) {
                        if (successCallback) {
                            successCallback(rs.data);
                        }
                    } else {
                        if (unsuccessCallback) {
                            unsuccessCallback(rs.data);
                        }
                    }
                    if(!withoutLoading){
                        me.loadingHide(appConfig);
                    }
                } catch (err) {
                    me.catchError(err);
                    if(!withoutLoading){
                        me.loadingHide(appConfig);
                    }
                }
                
            }, function (resp) {
                console.log('Error status: ' + resp.status);
                me.messagebox('შეცდომა', 'ფაილის ატვირთვის დროს მოხდა შეცდომა');
                me.loadingHide(appConfig);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            }); 
            
        } catch (err) {
            if(!withoutLoading){
                me.catchError(err);
            }
            me.loadingHide(appConfig);
        }
        
        
    },
    
    
    
    
    http: function (appConfig, className, methodName, params, successCallback, unsuccessCallback, withoutLoading, requestMethod) {
        
        var me = this;
        try {
            if(!withoutLoading){
                me.loadingShow(appConfig);
            }
            
            me._httpExec(className, methodName, params, function (rs) {
                try {
                    var actionText = params.action? params.action: "{0}/{1}".format(className, methodName);
                    
                    if (me.checkAjaxResponse(appConfig, rs, actionText)) {
                        if (successCallback) {
                            successCallback(rs);
                        }
                    } else {
                        if (unsuccessCallback) {
                            unsuccessCallback(rs);
                        }
                    }
                    if(!withoutLoading){
                        me.loadingHide(appConfig);
                    }
                } catch (err) {
                    me.catchError(err);
                    if(!withoutLoading){
                        me.loadingHide(appConfig);
                    }
                }
            },
            requestMethod);
        } catch (err) {
            if(!withoutLoading){
                me.catchError(err);
            }
            me.loadingHide(appConfig);
        }
    },
    _httpExec: function (className, methodName, params, callback, requestMethod) {
        var me = this;
        if(requestMethod && requestMethod=='GET'){
            me.angularServices.$http.get("{0}/{1}".format(className, methodName), {
                params: params
            }).success(function (response) {
                if (callback) {
                    callback(response);
                }
            });
        }else{
            me.angularServices.$http.post("{0}/{1}".format(className, methodName), params)
                    .success(function (response) {
                        if (callback) {
                            callback(response);
                        }
                    });
        }
    }
};