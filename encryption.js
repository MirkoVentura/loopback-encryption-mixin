/**
 * Created by Mekuanent Getachew on 5/25/18.
 */
var crypto = require('crypto');

module.exports = function (Model, options) {

    'use strict';

    var defaultOpt = {
        "fields": [],
        "password": "asiyd87yshd23878hujnwqd78",
        "salt": "oldrleovjja0jz7h",
        "iteration": 100,
        "hashBytes": 16,
        "hashAlgorithm": "sha1",
        "hexIv": "cd5c632d26fde5e2eb61e521ad2b91ba",
        "encryptionAlgorithm": "aes-128-cbc"
    };

    Model.observe('persist', function event(ctx, next) {

        var iv = Buffer.from(options.hexIv || defaultOpt.hexIv, "hex");
        crypto.pbkdf2(options.password || defaultOpt.password,
            options.salt || defaultOpt.salt,
            options.iteration || defaultOpt.iteration,
            options.hashBytes || defaultOpt.hashBytes,
            options.hashAlgorithm || defaultOpt.hashAlgorithm,
            function (err, derivedKey) {
                if (err) {
                    console.log(err);
                    next(err);
                }
                else {
                    var fields = options.fields || defaultOpt.fields;

                    try{
                        for (var i in fields) {
                            var cipher = crypto.createCipheriv(options.encryptionAlgorithm || defaultOpt.encryptionAlgorithm, derivedKey, iv);
                            var crypted = cipher.update(ctx.data[fields[i]], 'utf8', 'hex');
                            crypted += cipher.final('hex');
                            ctx.data[fields[i]] = crypted;
                        }
                    }catch (ex){
                        ex.message += "\nThis usually happens when the field contains a plain text! please make sure to remove/re-save that";
                        console.log(ex.message);
                    }finally {
                        next();
                    }
                }
            });
    });

    Model.observe('loaded', function event(ctx, next) {

        var iv = Buffer.from(options.hexIv || defaultOpt.hexIv, "hex");
        crypto.pbkdf2(options.password || defaultOpt.password,
            options.salt || defaultOpt.salt,
            options.iteration || defaultOpt.iteration,
            options.hashBytes || defaultOpt.hashBytes,
            options.hashAlgorithm || defaultOpt.hashAlgorithm,
            function (err, derivedKey) {
                if (err) {
                    console.log(err);
                    next(err);
                }
                else {

                    var fields = options.fields || defaultOpt.fields;
                    try{
                        for (var i in fields) {
                            var cipher = crypto.createDecipheriv(options.encryptionAlgorithm || defaultOpt.encryptionAlgorithm, derivedKey, iv);
                            var decrypted = cipher.update(ctx.data[fields[i]], 'hex', 'utf8');
                            decrypted += cipher.final('utf8');
                            ctx.data[fields[i]] = decrypted;
                        }
                    }catch (ex){
                        ex.message += "\nThis usually happens when the field contains a plain text! please make sure to remove/re-save that";
                        console.log(ex.message);
                    }finally {
                        next();
                    }


                }
            });
    });

    Model.observe('access', function event(ctx, next){

        var iv = Buffer.from(options.hexIv || defaultOpt.hexIv, "hex");
        crypto.pbkdf2(options.password || defaultOpt.password,
            options.salt || defaultOpt.salt,
            options.iteration || defaultOpt.iteration,
            options.hashBytes || defaultOpt.hashBytes,
            options.hashAlgorithm || defaultOpt.hashAlgorithm,
            function (err, derivedKey) {
            if (err) {
                console.log(err);
                next(err);
            }
            else {
                var fields = options.fields || defaultOpt.fields;
                try{
                    for (var i in fields) {
                        var queryParam = ctx.query.where[fields[i]];
                        if(queryParam === undefined){
                            continue;
                        }
                        if (queryParam.constructor.name === "Object") {
                            var keys = Object.keys(queryParam);
                            for (var j in keys) {
                                var cipher = crypto.createCipheriv(options.encryptionAlgorithm || defaultOpt.encryptionAlgorithm, derivedKey, iv);
                                var crypted = cipher.update(toCrypt, 'utf8', 'hex');
                                crypted += cipher.final('hex');
                                queryParam[keys[j]] = crypted;
                            }
                            ctx.query.where[fields[i]] = queryParam;
                        }else{
                            var cipher = crypto.createCipheriv(options.encryptionAlgorithm || defaultOpt.encryptionAlgorithm, derivedKey, iv);
                            var crypted = cipher.update(ctx.query.where[fields[i]], 'utf8', 'hex');
                            crypted += cipher.final('hex');
                            ctx.query.where[fields[i]] = crypted;
                        }
                    }
                }catch (ex){
                    ex.message += "\nThis usually happens when the field contains a plain text! please make sure to remove/re-save that";
                    console.log(ex.message);
                }finally {
                    console.log('Crypted %s matching %s', ctx.Model.modelName, ctx.query.where);
                    next();
                }
            }
        });
    });

};
