
/************
En este archivo inyectamos las dependencias de la aplicacion + route

example1.app = nombre componente
	inyectamos los submodulos que se necesitara
		-> example1.controller = controlador
		-> example1.directive = directivas
		-> example1.service = servicios (llamadas a la api rest)
************/
angular.module('example1.app', ['example1.controller','example1.service','example1.directive']);