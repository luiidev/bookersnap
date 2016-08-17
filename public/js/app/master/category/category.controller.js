/**
 * Created by BS on 12/08/2016.
 */
angular.module('category.controller', ['ngFileUpload', 'ngImgCrop', 'angucomplete-alt', 'bsLoadingOverlay'])
    .run(function (bsLoadingOverlayService) {
        bsLoadingOverlayService.setGlobalConfig({
            delay: 0, // Minimal delay to hide loading overlay in ms.
            activeClass: undefined, // Class that is added to the element where bs-loading-overlay is applied when the overlay is active.
            templateUrl: 'overlay-template.html', // Template url for overlay element. If not specified - no overlay element is created.
            templateOptions: undefined // Options that are passed to overlay template (specified by templateUrl option above).
        });
    })
    //-----------------------------------
    // LISTA DE CATEGORIAS
    //-----------------------------------
    .
    controller('CategoryListController', function (CategoryListService, ngTableParams, $filter, bsLoadingOverlayService) {

        var vm = this;
        vm.categorias = [];
        vm.flags = {};
        vm.flags.isLoading = false;
        vm.dirCategoryLogo = '/files/categories/image/80x80/';
        vm.categoryListListener = GetListCategoryListener();
        vm.$onInit = fn_onInit();

        function fn_onInit() {
            CategoryListService.GetList(vm.categoryListListener);
        }

        vm.deleteCategory = function (id) {
            swal({
                title: "Confimar",
                text: "Se va eliminar la categoría",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Sí, borrar ahora",
                cancelButtonText: "No, cancelar",
                closeOnConfirm: true,
                closeOnCancel: true
            }, function (isConfirm) {
                if (isConfirm) {
                    CategoryListService.DeleteCategory(id, {
                        BeforeSend: function () {
                            showOverlay(true);
                        },
                        OnSuccess: function (Response) {
                            showOverlay(false);
                            var data = Response.data;
                            CategoryListService.GetList(vm.categoryListListener);
                            swal("Borrada!", "La categoría ha sido eliminada", "success");
                        },
                        OnError: function (Response) {
                            showOverlay(false);
                            try {
                                swal("Error", "Ocurrió un error al borrar la categoría", "error");
                            } catch ($e) {
                                swal("Error", "Ocurrió un error en el servidor", "error");
                            }
                        }
                    });
                }
            });

        }

        function GetListCategoryListener() {
            return {
                BeforeSend: function () {
                    vm.now = fn_now();
                    vm.flags.isLoading = true;
                    showOverlay(vm.flags.isLoading);
                },
                OnSuccess: function (Response) {
                    vm.flags.isLoading = false;
                    showOverlay(vm.flags.isLoading);
                    var data = Response.data.data;
                    vm.categorias = data;
                    //vm.pagination = data.pagination;
                    initDataTable();
                },
                OnError: function (Response) {
                    vm.flags.isLoading = false;
                    showOverlay(vm.flags.isLoading);
                }
            };
        }

        function initDataTable() {
            var data = vm.categorias;
            vm.categoryTable = new ngTableParams({
                page: 1,            // show first page
                count: 5
            }, {
                total: data.length, // length of data
                getData: function ($defer, params) {
                    // use build-in angular filter
                    var orderedData = params.filter() ? $filter('filter')(data, params.filter()) : data;

                    this.id = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.name = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.email = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.username = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.contact = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                    params.total(orderedData.length); // set total for recalc pagination
                    $defer.resolve(this.id, this.name, this.email, this.username, this.contact);
                }
            })
        }

        function fn_now() {
            return new Date().getTime();
        }

        function showOverlay(bool) {
            if (bool) {
                bsLoadingOverlayService.start();
            } else {
                bsLoadingOverlayService.stop();
            }
        }

    })
    //-----------------------------------
    // CREAR CATEGORIAS
    //-----------------------------------
    .controller('CategoryCreateController', function (CategoryCreateService, Upload, $state, bsLoadingOverlayService) {
        var vm = this;
        vm.croppedLogo = {cropWidth: 100, cropHeight: 100, cropTop: 0, cropLeft: 10};
        vm.croppedFavicon = {cropWidth: 100, cropHeight: 100, cropTop: 0, cropLeft: 10};
        vm.categoria = {status: 1};
        vm.flags = {
            uploadingFavicon: false,
            uploadingLogo: false
        };
        init();

        vm.onSelectSubCategory = function (item) {
            if (item.originalObject == null) {
                return false;
            }
            if (angular.isString(item.originalObject)) {
                if (item.originalObject == "") {
                    return false;
                }
                var subCategoria = {name: item.originalObject};
            } else {
                var subCategoria = item.originalObject;
            }

            if (angular.isUndefined(vm.categoria.subcategories)) {
                vm.categoria.subcategories = [];
            }

            if (!isNameInSubCategorys(subCategoria.name)) {
                vm.categoria.subcategories.push(subCategoria);
            }
        };

        vm.UploadImageLogo = function (file) {
            if (file == null) {
                messageAlert("Logo", "Seleccione imagen mayor a 300px x 300px", "warning");
                delete vm.file_image_logo;
            }
            var url = CategoryCreateService.GetUrlUploadImgLogo();
            vm.flags.uploadingLogo = true;
            uploadImage(vm.file_image_logo, url, {
                success: function (Response) {
                    vm.flags.uploadingLogo = false;
                    vm.categoria.image_logo = Response.data.basename;
                    vm.categoria.image_logo_fullname = Response.data.fullname;
                },
                error: function (Response) {
                    vm.flags.uploadingLogo = false;
                    vm.clearImageLogo();
                },
                progress: function (evt) {

                }
            });
        };

        vm.UploadImageFavicon = function (file) {
            if (file == null) {
                messageAlert("Favicon", "Seleccione imagen mayor a 300px x 300px", "warning");
                delete vm.file_image_favicon;
            }
            var url = CategoryCreateService.GetUrlUploadImgFavicon();
            vm.flags.uploadingFavicon = true;
            uploadImage(vm.file_image_favicon, url, {
                success: function (Response) {
                    vm.flags.uploadingFavicon = false;
                    vm.categoria.image_favicon = Response.data.basename;
                    vm.categoria.image_favicon_fullname = Response.data.fullname;
                },
                error: function (Response) {
                    vm.flags.uploadingFavicon = false;
                    vm.clearImageFavicon();
                },
                progress: function (evt) {

                }
            });
        };

        vm.clearImageLogo = function () {
            delete vm.file_image_logo;
            delete vm.croppedImageLogoDataUrl;
        };

        vm.clearImageFavicon = function () {
            delete vm.file_image_favicon;
            delete vm.croppedImageFaviconDataUrl;
        };

        vm.guardarCategoria = function () {
            if (vm.categoria.image_favicon == null || vm.categoria.image_logo == null) {
                swal('Faltan las imágenes', 'Seleccione la imagen de logo y el favicon', 'warning');
                return;
            }
            CategoryCreateService.SaveCategory(vm.categoria, {
                BeforeSend: function () {
                    showOverlay(true);
                },
                OnSuccess: function (Response) {
                    showOverlay(false);
                    messageAlert('Categoría creada', '', 'success');
                    $state.go('category');
                },
                OnError: function (Response) {
                    showOverlay(false);
                    try {
                        var data = Response.data;
                        if (Response.status == 422) {
                            var errors = '';
                            angular.forEach(Response.data.error.errors, function (error, key) {
                                errors += '\n- ' + error + '\n';
                            });
                            swal(Response.data.error.user_msg, errors, "error")
                        } else {
                            swal("Error", data.error.user_msg, "error")
                        }
                    } catch ($e) {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    }

                }
            });
        };

        vm.removeSubCategory = function (item) {
            vm.categoria.subcategories.splice(vm.categoria.subcategories.indexOf(item), 1);
        };

        function isNameInSubCategorys(name) {
            var found = vm.categoria.subcategories.some(function (item) {
                return item.name == name;
            });
            return found;
        }

        function getSubcategories() {
            CategoryCreateService.GetListSubcategories({
                BeforeSend: function () {

                },
                OnSuccess: function (Response) {
                    var data = Response.data;
                    if (data.success) {
                        vm.listSubcategorys = data.data;
                    } else {
                        vm.listSubcategorys = [];
                    }
                },
                OnError: function (Response) {
                    vm.listSubcategorys = [];
                }
            });
        }

        function uploadImage(file, url, listener) {
            Upload.upload({
                url: url,
                data: {file: file}
            }).then(function (response) {
                listener.success(response);
            }, function (response) {
                listener.error(response);
            }, function (evt) {
                listener.progress(evt);
                //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
        }

        function init() {
            getSubcategories();
        }

        function showOverlay(bool) {
            if (bool) {
                bsLoadingOverlayService.start();
            } else {
                bsLoadingOverlayService.stop();
            }
        }
    })
    //-----------------------------------
    // ACTUALIZAR CATEGORIAS
    //-----------------------------------
    .controller('CategoryUpdateController', function (CategoryUpdateService, Upload, $state, bsLoadingOverlayService, $stateParams) {
        var vm = this;
        vm.croppedLogo = {cropWidth: 100, cropHeight: 100, cropTop: 0, cropLeft: 10};
        vm.croppedFavicon = {cropWidth: 100, cropHeight: 100, cropTop: 0, cropLeft: 10};
        vm.urlImages = '/files/categories/image/';
        vm.flags = {
            uploadingFavicon: false,
            uploadingLogo: false
        };
        init();

        vm.onSelectSubCategory = function (item) {
            if (item.originalObject == null) {
                return false;
            }
            if (angular.isString(item.originalObject)) {
                if (item.originalObject == "") {
                    return false;
                }
                var subCategoria = {name: item.originalObject};
            } else {
                var subCategoria = item.originalObject;
            }

            if (angular.isUndefined(vm.categoria.subcategories)) {
                vm.categoria.subcategories = [];
            }

            if (!isNameInSubCategorys(subCategoria.name)) {
                vm.categoria.subcategories.push(subCategoria);
            }
        };

        vm.UploadImageLogo = function (file) {
            if (file == null) {
                messageAlert("Logo", "Seleccione imagen mayor a 300px x 300px", "warning");
                delete vm.file_image_logo;
            }
            var url = CategoryUpdateService.GetUrlUploadImgLogo();
            vm.flags.uploadingLogo = true;
            uploadImage(vm.file_image_logo, url, {
                success: function (Response) {
                    vm.flags.uploadingLogo = false;
                    vm.categoria.image_logo = Response.data.basename;
                    vm.categoria.image_logo_fullname = Response.data.fullname;
                },
                error: function (Response) {
                    vm.flags.uploadingLogo = false;
                    vm.clearImageLogo();
                },
                progress: function (evt) {

                }
            });
        };

        vm.UploadImageFavicon = function (file) {
            if (file == null) {
                messageAlert("Favicon", "Seleccione imagen mayor a 300px x 300px", "warning");
                delete vm.file_image_favicon;
            }
            var url = CategoryUpdateService.GetUrlUploadImgFavicon();
            vm.flags.uploadingFavicon = true;
            uploadImage(vm.file_image_favicon, url, {
                success: function (Response) {
                    vm.flags.uploadingFavicon = false;
                    vm.categoria.image_favicon = Response.data.basename;
                    vm.categoria.image_favicon_fullname = Response.data.fullname;
                },
                error: function (Response) {
                    vm.flags.uploadingFavicon = false;
                    vm.clearImageFavicon();
                },
                progress: function (evt) {

                }
            });
        };

        vm.clearImageLogo = function () {
            delete vm.file_image_logo;
            delete vm.croppedImageLogoDataUrl;
        };

        vm.clearImageFavicon = function () {
            delete vm.file_image_favicon;
            delete vm.croppedImageFaviconDataUrl;
        };

        vm.guardarCategoria = function () {
            if (vm.categoria.image_favicon == null || vm.categoria.image_logo == null) {
                swal('Faltan las imágenes', 'Seleccione la imagen de logo y el favicon', 'warning');
                return;
            }
            CategoryUpdateService.SaveCategory($stateParams.id, vm.categoria, {
                BeforeSend: function () {
                    showOverlay(true);
                },
                OnSuccess: function (Response) {
                    showOverlay(false);
                    messageAlert('Categoría actualizada', '', 'success');
                    $state.go('category');
                },
                OnError: function (Response) {
                    showOverlay(false);
                    try {
                        var data = Response.data;
                        if (Response.status == 422) {
                            var errors = '';
                            angular.forEach(Response.data.error.errors, function (error, key) {
                                errors += '\n- ' + error + '\n';
                            });
                            swal(Response.data.error.user_msg, errors, "error")
                        } else {
                            swal("Error", data.error.user_msg, "error")
                        }
                    } catch ($e) {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    }

                }
            });
        };

        vm.removeSubCategory = function (item) {
            vm.categoria.subcategories.splice(vm.categoria.subcategories.indexOf(item), 1);
        };

        function isNameInSubCategorys(name) {
            var found = vm.categoria.subcategories.some(function (item) {
                return item.name == name;
            });
            return found;
        }

        function getSubcategories() {
            CategoryUpdateService.GetListSubcategories({
                BeforeSend: function () {

                },
                OnSuccess: function (Response) {
                    var data = Response.data;
                    if (data.success) {
                        vm.listSubcategorys = data.data;
                    } else {
                        vm.listSubcategorys = [];
                    }
                },
                OnError: function (Response) {
                    vm.listSubcategorys = [];
                }
            });
        }

        function getCategory() {
            CategoryUpdateService.GetCategory($stateParams.id, {
                BeforeSend: function () {
                    showOverlay(true);
                },
                OnSuccess: function (Response) {
                    showOverlay(false);
                    vm.categoria = Response.data.data;
                    vm.file_image_favicon = vm.urlImages + '/80x80/' + vm.categoria.image_favicon;
                    vm.file_image_logo = vm.urlImages + '/160x160/' + vm.categoria.image_logo;
                },
                OnError: function (Response) {
                    showOverlay(false);
                    try {
                        var data = Response.data;
                        swal("Error", data.error.user_msg, "error");
                    } catch ($e) {
                        swal("Error", "Ocurrió un error en el servidor", "error");
                    }
                }
            });
        }

        function uploadImage(file, url, listener) {
            Upload.upload({
                url: url,
                data: {file: file}
            }).then(function (response) {
                listener.success(response);
            }, function (response) {
                listener.error(response);
            }, function (evt) {
                listener.progress(evt);
                //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
        }

        function init() {
            getCategory();
            getSubcategories();
        }

        function showOverlay(bool) {
            if (bool) {
                bsLoadingOverlayService.start();
            } else {
                bsLoadingOverlayService.stop();
            }
        }
    });

