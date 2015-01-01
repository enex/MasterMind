/** @jsx React.DOM */
var React = require('react');

var App = React.createClass({
    getInitialState: function() {
        var data = [];
        var result = [2, 4, 5, 7, 3];//6 unique
        for(var i = 0; i < 12; i++){
            data.push([0, 0, 0, 0, 0]);
        }

        var result = [];
        for(;result.length < 5;){
            var d = Math.round(Math.random()*7)+1;
            if(result.indexOf(d)<0)result.push(d);
        }

        return {data:data, result:result, solution: false, hintPos: 0};
    },
    handleClick: function(row, col){
        //this.setState({count: this.state.count + 1});
        var data = this.state.data;
        var cbe = true;//can be edited
        if(row > 0){
            var sv = [];
            data[row-1].map(function(i){
                if(i < 1)cbe=false;
                if(sv.indexOf(i)>=0)cbe=false;
                sv.push(i);
            });
        }
        if(row < 12){
            data[row+1].map(function(i){if(i > 0)cbe=false;});
        }
        if(cbe){
            data[row][col] = (data[row][col]<8)?(data[row][col]+1):1;
            this.setState({data: data, hintPos:row-1});
        }
    },
    newGame: function(){
        this.setState(this.getInitialState());
    },
    solution: function(){
        this.setState({solution: !this.state.solution});
    },
    render: function () {
        var self = this;
        var data = this.state.data;
        var result = this.state.result;

        var hints = data.map(function(d, row){
            return d.map(function(val, key){
                if(self.state.hintPos<row)return 0;
                if(val === result[key]){
                    return 2;
                }
                if(result.indexOf(val) >= 0){
                    return 1;
                }
                return 0;
            }).sort(function(a, b){return b-a}); //Absteigend sortieren
        });

        var colors = ["none","white","green","yellow","blue","orange","red","black","brown"];
        var hintColors = ["none", "white", "black"];

        return (<div className="MasterMind">
            <button onClick={this.newGame}>New Game</button>
            <button onClick={this.solution}>Show Solution</button>
            {this.state.solution?(<table>
                <tr>{result.map(function(t, col){
                    return(<td className={colors[t]} key={col}></td>);
                })}</tr>
            </table>):""}
            <table>
                {data.map(function(r, row){
                    return (<tr key={row}>
                        {r.map(function(t, col){
                            return <td className={colors[t]} key={col} onClick={function(){self.handleClick(row, col)}}></td>
                        }).concat([<td className="spacer"></td>]).concat(hints[row].map(function(t, col){
                            return <td className={hintColors[t]} key={col+"-hints"}></td>
                        }))}
                    </tr>);
                })}
            </table>
        </div>);
    }
});
React.render(<App/>, document.body);
