'use strict';
module.exports = StyledSelect

StyledSelect.$inject = ['_']
function StyledSelect(_) {
    return {
        restrict: 'A'
        ,link: function(scope, elm, attr){
            elm.after('<div></div>')
            elm.add(elm.next()).wrapAll('<div class="styled-select"></div>')

            scope.$watch(attr.ngModel, function(v){
                var currentOption;
                if (_.isEmpty(v)) {
                    currentOption = elm.children().first().text()
                } else {
                    currentOption = elm.find(':selected').text()
                }
                elm.next().text(currentOption)
            })
        }
    }
};