angular.module('floor.directive', [])
	.directive('ngDetailTable', function() {

		function makeSelectTable(scope, element, attr) {

			var left = attr.x;
			var top = attr.y;

			element.css({
				position: 'absolute',
				cursor: 'pointer',
				top: top + 'px',
				left: left + 'px',
			});


			element.on('click', function(event) {

				event.preventDefault();
				scope.onClickFn();

			});
		}

		return {
			link: makeSelectTable,
			scope: {
				onClickFn: '&'
			}
		};

	})