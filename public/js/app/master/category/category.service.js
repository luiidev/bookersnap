/**
 * Created by BS on 12/08/2016.
 */
angular.module('category.service', [])
    .factory('CategoryListService', function (Ajax) {
        return {
            GetList: function ($listener) {
                Ajax.Req('get', '/master/ajax/category', {}, $listener);
            },
            DeleteCategory: function ($id, $listener) {
                Ajax.Req('delete', '/master/ajax/category/' + $id, {}, $listener);
            }
        }
    })
    .factory('CategoryCreateService', function (Ajax) {
        return {
            GetUrlUploadImgLogo: function () {
                return '/master/ajax/category/upload/logo';
            },
            GetUrlUploadImgFavicon: function () {
                return '/master/ajax/category/upload/favicon';
            },
            GetListSubcategories: function ($listener) {
                Ajax.Req('get', '/master/ajax/category/subcategories', {}, $listener);
            },
            SaveCategory: function ($data, $listener) {
                Ajax.Req('post', '/master/ajax/category/', $data, $listener);
            }
        }
    })
    .factory('CategoryUpdateService', function (Ajax) {
        return {
            GetUrlUploadImgLogo: function () {
                return '/master/ajax/category/upload/logo';
            },
            GetUrlUploadImgFavicon: function () {
                return '/master/ajax/category/upload/favicon';
            },
            GetCategory: function ($id, $listener) {
                Ajax.Req('get', '/master/ajax/category/' + $id, {}, $listener);
            },
            GetListSubcategories: function ($listener) {
                Ajax.Req('get', '/master/ajax/category/subcategories', {}, $listener);
            },
            SaveCategory: function ($id, $data, $listener) {
                Ajax.Req('put', '/master/ajax/category/' + $id, $data, $listener);
            }
        }
    });