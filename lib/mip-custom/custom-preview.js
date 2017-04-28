/**
 * @file 定制化 MIP 组件预览
 * @author wupeng(smartfutureplayer@gmail.com)
 */

'use strict';
const cli = require('../cli');
const fs = require('fs');
const path = require('path');
const boilerplate = require('../boilerplate');
const fecs = require('fecs');
const execSync = require('child_process').execSync;
const common = require('./custom-common');
const validator = require('mip-validator')();
const request = require('request');
const constVarible = require('./custom-defined');
const compile = require('./custom-compile');

const dist = "dist";
const tmp = "tmp";

function exec(config, cb) {
    let customData = config.mipCustomData;
    let customItems = config.mipCustomItems;
    let customDir = config.mipCustomDir;
    rootPath = config.baseDir || process.cwd();
    rootPath = path.resolve(rootPath, customDir);
    let filePath = path.resolve(rootPath, src, template);
    if (customData) {
        request(
            {
                url: customData,
                timeout: 10000
            },
            function (err, res, body) {
                if (!err && res.statusCode === 200) {
                    let data;
                    try {
                        data = JSON.parse(body);
                    } catch (e) {
                        cli.warn("The requested data is not legal,please use json formate!");
                        return;
                    }
                    let tplName = [];
                    if (!data) {
                        cli.warn("The return data can not be empty");
                        return;
                    }
                    if (!data.data) {
                        cli.warn("The 'data' field of the returned data can not be empty");
                        return;
                    }
                    if (!data.data.template) {
                        cli.warn("The 'template' field of the returned data can not be empty");
                        return;
                    }
                    if (!(data.data.template instanceof Array)) {
                        cli.warn("The 'template' field must be an array type");
                        return;
                    }
                    let tplsData = data.data;
                    if (tplsData && tplsData.template) {
                        var tplData = tplsData.template;
                        tplData.forEach(function (items) {
                            if (!(items instanceof Array)) {
                                cli.warn("The value in the 'template' field must be an array type");
                                return;
                            }
                            items.forEach(function (item) {
                                let isExisted = false;
                                tplName.forEach(function (tpl) {
                                    if (tpl === item.tplName) {
                                        isExisted = true;
                                    }
                                });
                                if (!isExisted) {
                                    tplName.push(template + '/' + item.tplName);
                                }
                            });
                        });
                    }
                    tplName = common.handleDependence(rootPath, tplName);
                    if (tplName) {
                        component = tplName;
                        compile.exec({
                            baseDir: config.baseDir,
                            filePath: filePath,
                            customItems: customItems,
                            data: data,
                            cb: cb,
                            dist: dist,
                            tmp: tmp,
                            type: preview
                        });
                    }
                }
                else {
                    cli.warn('fetch mip custom data failed.');
                }
            }
        );
    } else {
        customItems.forEach(function (item) {
            component = component.concat(item);
        });
        component = common.handleDependence(rootPath, component);
        compile.exec({
            baseDir: config.baseDir,
            filePath: filePath,
            customItems: customItems,
            data: null,
            cb: cb,
            dist: dist,
            tmp: tmp,
            type: preview
        });
    }
}

exports.exec = exec;