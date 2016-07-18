
/************
En este archivo inyectamos las dependencias de la aplicacion + route

example.app = nombre componente
	inyectamos los submodulos que se necesitara
		-> example.controller = controlador
		-> example.directive = directivas
		-> example.service = servicios (llamadas a la api rest)
************/
angular.module('example.app', ['example.controller','example.service','example.directive']);