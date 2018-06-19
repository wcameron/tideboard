'use strict';
module.exports = StyledSelect
const isEmpty = require('lodash.isempty')

StyledSelect.$inject = []
function StyledSelect() {
    return {
        restrict: 'A'
        ,link: function(scope, elm, attr){

            elm.wrap('<div class="styled-select"></div>')
            elm.after('<div></div>')

            scope.$watch(attr.ngModel, function(v){
                var currentOption;
                if (isEmpty(v)) {
                    currentOption = elm[0].options[0].text
                } else {
                    currentOption = elm[0].options[elm[0].selectedIndex].text
                }
                elm.next().text(currentOption)
            })
        }
    }
};
