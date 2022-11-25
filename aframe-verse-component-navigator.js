AFRAME.registerComponent('navigator', {
  schema:{
    destinationColor: {default:"#888"}, 
    destinationSize:  {default:0.2}
  }, 
  init: function(){
    let dom = this.dom = document.createElement("a-entity")
    let s = this.data.destinationSize
    dom.innerHTML = `<a-entity class="hit" id="navigator">
        <a-text id="destination" value="           " align="center" scale="${s} ${s} ${s}" color="${this.data.destinationColor}" position="0 0.09 0"></a-text>
        <a-entity id="prev"     button="label: <; width:0.05" position="-0.085 0 0"></a-entity>
        <a-entity id="teleport" button="label: teleport; width:0.1" position="0 0 0"></a-entity>
        <a-entity id="back"     button="label: back; width:0.1" position="0 -0.06 0" visible="false"></a-entity>
        <a-entity id="next"     button="label: >; width:0.05" position=" 0.085 0 0"></a-entity>
      </a-entity>
    `
    this.el.appendChild(dom)
    this.update()

    $('[aframe-verse]').addEventListener("registerJSON", (e) => {
      if( this.current ) return // already set default
      this.currentIndex = 0
      this.current = e.detail.json.destinations[this.currentIndex]
      let events = ["click", "collide"]
      events.map( (e) => {
        dom.querySelector("#next").addEventListener( e, (e) => this.scroll( 1, e) )
        dom.querySelector("#prev").addEventListener( e, (e) => this.scroll(-1, e) )
        dom.querySelector("#teleport").addEventListener( e, (e) => this.teleport(e) )
        dom.querySelector("#back").addEventListener( e, (e) => this.teleport(e, "/") )
      })
      this.skipCurrent(this.current.url);
      this.update()
    })
  }, 
  update: function(){
    let dest = this.dom.querySelector("#destination")
    if( !dest ) return 
    if( !this.current ) return
    dest.setAttribute("value", this.next.title || this.next.url )
  }, 
  getDestinations: function(){
    let averse = $('[aframe-verse]')
    if( averse.components["aframe-verse"] ) return averse.components["aframe-verse"].destinations
    else return [{url:""}]
  }, 
  skipCurrent: function(new_url, offset){
    if( new_url == this.current.url ){
      this.scroll( typeof offset == 'undefined' ? 1 : offset); // skip current
      return true
    }
    return false
  }, 
  scroll: function(offset, e){
    let destinations = this.getDestinations()
    if( destinations.length == 0 ) return
    this.currentIndex+=offset
    if( this.currentIndex <= 0 ) this.currentIndex = this.currentIndex + destinations.length
    if( this.currentIndex >= 0 ) this.currentIndex = this.currentIndex % destinations.length
    if( this.skipCurrent( destinations[this.currentIndex].url,  offset ) ) return
    this.next = destinations[this.currentIndex]
    this.update()
  }, 
  teleport:function(e, href){
    let com = AFRAME.components.href.Component.prototype
    this.current = this.next
    href = href || this.current.url
    com.teleport(e, href)
    let ishome = ( this.current.url == "./index.html" || this.current.url == "/" )
    $('[navigator] #back').setAttribute("visible", !ishome )
    this.dom.querySelector("#destination").setAttribute("value", href)
  }
})
