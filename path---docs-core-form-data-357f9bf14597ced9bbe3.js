webpackJsonp([0xc94984bc3bb6],{401:function(n,a){n.exports={data:{post:{html:'<h1 id="accept-applicationx-www-form-urlencoded-form-data"><a href="#accept-applicationx-www-form-urlencoded-form-data" aria-hidden="true" class="anchor"><svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>Accept <code>application/x-www-form-urlencoded</code> Form Data</h1>\n<p>API Platform only supports raw documents as request input (encoded in JSON, XML, YAML...). This has many advantages including support of types and the ability to send back to the API documents originally retrieved through a <code>GET</code> request.\nHowever, sometimes - for instance, to support legacy clients - it is necessary to accept inputs encoded in the traditional <a href="https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1" target="_blank" rel="nofollow noopener noreferrer"><code>application/x-www-form-urlencoded</code></a> format (HTML form content type). This can easily be done using <a href="/docs/core/events">the powerful event system</a> of the framework.</p>\n<p>In this tutorial, we will decorate the default <code>DeserializeListener</code> class to handle form data if applicable, and delegate to the built-in listener for other cases.</p>\n<h2 id="create-your-deserializelistener-decorator"><a href="#create-your-deserializelistener-decorator" aria-hidden="true" class="anchor"><svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>Create your <code>DeserializeListener</code> Decorator</h2>\n<p>This decorator is able to denormalize posted form data to the target object. In case of other format, it fallbacks to the original <a href="https://github.com/api-platform/core/blob/91dc2a4d6eeb79ea8dec26b41e800827336beb1a/src/Bridge/Symfony/Bundle/Resources/config/api.xml#L85-L91" target="_blank" rel="nofollow noopener noreferrer">DeserializeListener</a>.</p>\n<div class="gatsby-highlight">\n      <pre class="language-php"><code><span class="token delimiter important">&lt;?php</span>\n<span class="token comment">// api/src/EventListener/DeserializeListener.php</span>\n\n<span class="token keyword">namespace</span> <span class="token package">App<span class="token punctuation">\\</span>EventListener</span><span class="token punctuation">;</span>\n\n<span class="token keyword">use</span> <span class="token package">ApiPlatform<span class="token punctuation">\\</span>Core<span class="token punctuation">\\</span>Exception<span class="token punctuation">\\</span>RuntimeException</span><span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">ApiPlatform<span class="token punctuation">\\</span>Core<span class="token punctuation">\\</span>Util<span class="token punctuation">\\</span>RequestAttributesExtractor</span><span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">Symfony<span class="token punctuation">\\</span>Component<span class="token punctuation">\\</span>HttpFoundation<span class="token punctuation">\\</span>Request</span><span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">Symfony<span class="token punctuation">\\</span>Component<span class="token punctuation">\\</span>HttpKernel<span class="token punctuation">\\</span>Event<span class="token punctuation">\\</span>GetResponseEvent</span><span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">ApiPlatform<span class="token punctuation">\\</span>Core<span class="token punctuation">\\</span>EventListener<span class="token punctuation">\\</span>DeserializeListener</span> <span class="token keyword">as</span> DecoratedListener<span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">Symfony<span class="token punctuation">\\</span>Component<span class="token punctuation">\\</span>Serializer<span class="token punctuation">\\</span>Normalizer<span class="token punctuation">\\</span>DenormalizerInterface</span><span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">ApiPlatform<span class="token punctuation">\\</span>Core<span class="token punctuation">\\</span>Serializer<span class="token punctuation">\\</span>SerializerContextBuilderInterface</span><span class="token punctuation">;</span>\n\n<span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">DeserializeListener</span>\n<span class="token punctuation">{</span>\n    <span class="token keyword">private</span> <span class="token variable">$decorated</span><span class="token punctuation">;</span>\n    <span class="token keyword">private</span> <span class="token variable">$denormalizer</span><span class="token punctuation">;</span>\n    <span class="token keyword">private</span> <span class="token variable">$serializerContextBuilder</span><span class="token punctuation">;</span>\n\n    <span class="token keyword">public</span> <span class="token keyword">function</span> <span class="token function">__construct</span><span class="token punctuation">(</span>DenormalizerInterface <span class="token variable">$denormalizer</span><span class="token punctuation">,</span> SerializerContextBuilderInterface <span class="token variable">$serializerContextBuilder</span><span class="token punctuation">,</span> DecoratedListener <span class="token variable">$decorated</span><span class="token punctuation">)</span>\n    <span class="token punctuation">{</span>\n        <span class="token variable">$this</span><span class="token operator">-</span><span class="token operator">></span><span class="token property">denormalizer</span> <span class="token operator">=</span> <span class="token variable">$denormalizer</span><span class="token punctuation">;</span>\n        <span class="token variable">$this</span><span class="token operator">-</span><span class="token operator">></span><span class="token property">serializerContextBuilder</span> <span class="token operator">=</span> <span class="token variable">$serializerContextBuilder</span><span class="token punctuation">;</span>\n        <span class="token variable">$this</span><span class="token operator">-</span><span class="token operator">></span><span class="token property">decorated</span> <span class="token operator">=</span> <span class="token variable">$decorated</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n\n    <span class="token keyword">public</span> <span class="token keyword">function</span> <span class="token function">onKernelRequest</span><span class="token punctuation">(</span>GetResponseEvent <span class="token variable">$event</span><span class="token punctuation">)</span><span class="token punctuation">:</span> void <span class="token punctuation">{</span>\n        <span class="token variable">$request</span> <span class="token operator">=</span> <span class="token variable">$event</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">getRequest</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token variable">$request</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">isMethodSafe</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">||</span> <span class="token variable">$request</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">isMethod</span><span class="token punctuation">(</span>Request<span class="token punctuation">:</span><span class="token punctuation">:</span><span class="token constant">METHOD_DELETE</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token keyword">return</span><span class="token punctuation">;</span>\n        <span class="token punctuation">}</span>\n\n        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token string">\'form\'</span> <span class="token operator">===</span> <span class="token variable">$request</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">getContentType</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token variable">$this</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">denormalizeFormRequest</span><span class="token punctuation">(</span><span class="token variable">$request</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span>\n            <span class="token variable">$this</span><span class="token operator">-</span><span class="token operator">></span><span class="token property">decorated</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">onKernelRequest</span><span class="token punctuation">(</span><span class="token variable">$event</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token punctuation">}</span>\n    <span class="token punctuation">}</span>\n\n    <span class="token keyword">private</span> <span class="token keyword">function</span> <span class="token function">denormalizeFormRequest</span><span class="token punctuation">(</span>Request <span class="token variable">$request</span><span class="token punctuation">)</span><span class="token punctuation">:</span> void\n    <span class="token punctuation">{</span>\n        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span><span class="token variable">$attributes</span> <span class="token operator">=</span> RequestAttributesExtractor<span class="token punctuation">:</span><span class="token punctuation">:</span><span class="token function">extractAttributes</span><span class="token punctuation">(</span><span class="token variable">$request</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token keyword">return</span><span class="token punctuation">;</span>\n        <span class="token punctuation">}</span>\n\n        <span class="token variable">$context</span> <span class="token operator">=</span> <span class="token variable">$this</span><span class="token operator">-</span><span class="token operator">></span><span class="token property">serializerContextBuilder</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">createFromRequest</span><span class="token punctuation">(</span><span class="token variable">$request</span><span class="token punctuation">,</span> <span class="token boolean">false</span><span class="token punctuation">,</span> <span class="token variable">$attributes</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token variable">$populated</span> <span class="token operator">=</span> <span class="token variable">$request</span><span class="token operator">-</span><span class="token operator">></span><span class="token property">attributes</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">get</span><span class="token punctuation">(</span><span class="token string">\'data\'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token keyword">null</span> <span class="token operator">!==</span> <span class="token variable">$populated</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token variable">$context</span><span class="token punctuation">[</span><span class="token string">\'object_to_populate\'</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token variable">$populated</span><span class="token punctuation">;</span>\n        <span class="token punctuation">}</span>\n\n        <span class="token variable">$data</span> <span class="token operator">=</span> <span class="token variable">$request</span><span class="token operator">-</span><span class="token operator">></span><span class="token property">request</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">all</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token variable">$object</span> <span class="token operator">=</span> <span class="token variable">$this</span><span class="token operator">-</span><span class="token operator">></span><span class="token property">denormalizer</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">denormalize</span><span class="token punctuation">(</span><span class="token variable">$data</span><span class="token punctuation">,</span> <span class="token variable">$attributes</span><span class="token punctuation">[</span><span class="token string">\'resource_class\'</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token variable">$context</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token variable">$request</span><span class="token operator">-</span><span class="token operator">></span><span class="token property">attributes</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">set</span><span class="token punctuation">(</span><span class="token string">\'data\'</span><span class="token punctuation">,</span> <span class="token variable">$object</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n</code></pre>\n      </div>\n<h2 id="creating-the-service-definition"><a href="#creating-the-service-definition" aria-hidden="true" class="anchor"><svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>Creating the Service Definition</h2>\n<div class="gatsby-highlight">\n      <pre class="language-yaml"><code><span class="token comment"># api/config/services.yaml</span>\n<span class="token key atrule">services</span><span class="token punctuation">:</span>\n    <span class="token comment"># ...</span>\n    <span class="token key atrule">\'App\\EventListener\\DeserializeListener\'</span><span class="token punctuation">:</span>\n        <span class="token key atrule">tags</span><span class="token punctuation">:</span>\n            <span class="token punctuation">-</span> <span class="token punctuation">{</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> <span class="token string">\'kernel.event_listener\'</span><span class="token punctuation">,</span> <span class="token key atrule">event</span><span class="token punctuation">:</span> <span class="token string">\'kernel.request\'</span><span class="token punctuation">,</span> <span class="token key atrule">method</span><span class="token punctuation">:</span> <span class="token string">\'onKernelRequest\'</span><span class="token punctuation">,</span> <span class="token key atrule">priority</span><span class="token punctuation">:</span> <span class="token number">2 </span><span class="token punctuation">}</span>\n        <span class="token comment"># Autoconfiguration must be disabled to set a custom priority</span>\n        <span class="token key atrule">autoconfigure</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>\n</code></pre>\n      </div>\n<h2 id="cleanup-the-original-listener"><a href="#cleanup-the-original-listener" aria-hidden="true" class="anchor"><svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>Cleanup the Original Listener</h2>\n<p>The decorated DeserializeListener is called on demand, so it\'s better to eliminate its own tags:</p>\n<div class="gatsby-highlight">\n      <pre class="language-php"><code><span class="token delimiter important">&lt;?php</span>\n<span class="token comment">// src/Kernel.php</span>\n\n<span class="token keyword">namespace</span> <span class="token package">App</span><span class="token punctuation">;</span>\n\n<span class="token keyword">use</span> <span class="token package">App<span class="token punctuation">\\</span>DependencyInjection<span class="token punctuation">\\</span>Compiler<span class="token punctuation">\\</span>CustomPass</span><span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">Symfony<span class="token punctuation">\\</span>Bundle<span class="token punctuation">\\</span>FrameworkBundle<span class="token punctuation">\\</span>Kernel<span class="token punctuation">\\</span>MicroKernelTrait</span><span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">Symfony<span class="token punctuation">\\</span>Component<span class="token punctuation">\\</span>DependencyInjection<span class="token punctuation">\\</span>ContainerBuilder</span><span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">Symfony<span class="token punctuation">\\</span>Component<span class="token punctuation">\\</span>HttpKernel<span class="token punctuation">\\</span>Kernel</span> <span class="token keyword">as</span> BaseKernel<span class="token punctuation">;</span>\n\n<span class="token keyword">class</span> <span class="token class-name">Kernel</span> <span class="token keyword">extends</span> <span class="token class-name">BaseKernel</span>\n<span class="token punctuation">{</span>\n    <span class="token keyword">use</span> <span class="token package">MicroKernelTrait</span><span class="token punctuation">;</span>\n\n    <span class="token comment">// ...</span>\n\n    <span class="token keyword">protected</span> <span class="token keyword">function</span> <span class="token function">build</span><span class="token punctuation">(</span>ContainerBuilder <span class="token variable">$container</span><span class="token punctuation">)</span><span class="token punctuation">:</span> void\n    <span class="token punctuation">{</span>\n        <span class="token variable">$container</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">addCompilerPass</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">class</span> <span class="token keyword">implements</span> <span class="token class-name">CompilerPassInterface</span> <span class="token punctuation">{</span>\n            <span class="token keyword">public</span> <span class="token keyword">function</span> <span class="token function">process</span><span class="token punctuation">(</span>ContainerBuilder <span class="token variable">$container</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n                <span class="token variable">$container</span>\n                    <span class="token operator">-</span><span class="token operator">></span><span class="token function">findDefinition</span><span class="token punctuation">(</span><span class="token string">\'api_platform.listener.request.deserialize\'</span><span class="token punctuation">)</span>\n                    <span class="token operator">-</span><span class="token operator">></span><span class="token function">clearTags</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n            <span class="token punctuation">}</span>\n        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n</code></pre>\n      </div>'},navDoc:{edges:[{node:{title:"The Distribution",path:"distribution",items:[{id:"index",title:"Creating a Fully Featured API in 5 Minutes",anchors:null},{id:"testing",title:"Testing and Specifying the API",anchors:null}]}},{node:{title:"The API Component",path:"core",items:[{id:"index",title:"Introduction",anchors:null},{id:"getting-started",title:"Getting Started",anchors:[{id:"installing-api-platform-core",title:"Installing API Platform Core"},{id:"before-reading-this-documentation",title:"Before Reading this Documentation"},{id:"mapping-the-entities",title:"Mapping the Entities"}]},{id:"configuration",title:"Configuration",anchors:null},{id:"operations",title:"Operations",anchors:[{id:"enabling-and-disabling-operations",title:"Enabling and Disabling Operations"},{id:"configuring-operations",title:"Configuring Operations"},{id:"subresources",title:"Subresources"},{id:"creating-custom-operations-and-controllers",title:"Creating Custom Operations and Controllers"}]},{id:"default-order",title:"Overriding Default Order",anchors:null},{id:"filters",title:"Filters",anchors:[{id:"doctrine-orm-filters",title:"Doctrine ORM Filters"},{id:"serializer-filters",title:"Serializer Filters"},{id:"creating-custom-filters",title:"Creating Custom Filters"},{id:"apifilter-annotation",title:"ApiFilter Annotation"}]},{id:"serialization",title:"The Serialization Process",anchors:[{id:"overall-process",title:"Overall Process"},{id:"available-serializers",title:"Available Serializers"},{id:"the-serialization-context-groups-and-relations",title:"The Serialization Context, Groups and Relations"},{id:"using-serialization-groups",title:"Using Serialization Groups"},{id:"using-different-serialization-groups-per-operation",title:"Using Different Serialization Groups per Operation"},{id:"changing-the-serialization-context-dynamically",title:"Changing the Serialization Context Dynamically"},{id:"changing-the-serialization-context-on-a-per-item-basis",title:"Changing the Serialization Context on a Per Item Basis"},{id:"name-conversion",title:"Name Conversion"},{id:"decorating-a-serializer-and-add-extra-data",title:"Decorating a Serializer and Add Extra Data"},{id:"entity-identifier-case",title:"Entity Identifier Case"},{id:"embedding-the-json-ld-context",title:"Embedding the JSON-LD Context"}]},{id:"validation",title:"Validation",anchors:[{id:"using-validation-groups",title:"Using Validation Groups"},{id:"dynamic-validation-groups",title:"Dynamic Validation Groups"},{id:"error-levels-and-payload-serialization",title:"Error Levels and Payload Serialization"}]},{id:"pagination",title:"Pagination",anchors:[{id:"disabling-the-pagination",title:"Disabling the Pagination"},{id:"changing-the-number-of-items-per-page",title:"Changing the Number of Items per Page"},{id:"partial-pagination",title:"Partial Pagination"}]},{id:"events",title:"The Event System",anchors:null},{id:"content-negotiation",title:"Content Negotiation",anchors:[{id:"enabling-several-formats",title:"Enabling Several Formats"},{id:"registering-a-custom-serializer",title:"Registering a Custom Serializer"},{id:"creating-a-responder",title:"Creating a Responder"},{id:"writing-a-custom-normalizer",title:"Writing a Custom Normalizer"}]},{id:"external-vocabularies",title:"Using External JSON-LD Vocabularies",anchors:null},{id:"extending-jsonld-context",title:"Extending JSON-LD context",anchors:null},{id:"data-providers",title:"Data Providers",anchors:[{id:"custom-collection-data-provider",title:"Custom Collection Data Provider"},{id:"custom-item-data-provider",title:"Custom Item Data Provider"},{id:"injecting-the-serializer-in-an-itemdataprovider",title:'Injecting the Serializer in an "ItemDataProvider"'}]},{id:"extensions",title:"Extensions",anchors:[{id:"custom-extension",title:"Custom Extension"},{id:"example",title:"Filter upon the current user"}]},{id:"security",title:"Security",anchors:null},{id:"performance",title:"Performance",anchors:[{id:"enabling-the-builtin-http-cache-invalidation-system",title:"Enabling the Builtin HTTP Cache Invalidation System"},{id:"enabling-the-metadata-cache",title:"Enabling the Metadata Cache"},{id:"using-ppm-php-pm",title:"Using PPM (PHP-PM)"},{id:"doctrine-queries-and-indexes",title:"Doctrine Queries and Indexes"}]},{id:"operation-path-naming",title:"Operation Path Naming",anchors:[{id:"configuration",title:"Configuration"},{id:"create-a-custom-operation-path-resolver",title:"Create a Custom Operation Path Naming"}]},{id:"form-data",title:"Accept application/x-www-form-urlencoded Form Data",anchors:null},{id:"fosuser-bundle",title:"FOSUserBundle Integration",anchors:[{id:"installing-the-bundle",title:"Installing the Bundle"},{id:"enabling-the-bridge",title:"Enabling the Bridge"},{id:"creating-a-user-entity-with-serialization-groups",title:'Creating a "User" Entity with Serialization Groups'}]},{id:"jwt",title:"Adding a JWT authentication using LexikJWTAuthenticationBundle",anchors:[{id:"testing-with-swagger",title:"Testing with Swagger"},{id:"testing-with-behat",title:"Testing with Behat"}]},{id:"nelmio-api-doc",title:"NelmioApiDocBundle integration",anchors:null},{id:"angularjs-integration",title:"AngularJS Integration",anchors:[{id:"restangular",title:"Restangular"},{id:"ng-admin",title:"ng-admin"}]},{id:"swagger",title:"Swagger Support",anchors:[{id:"override-swagger-documentation",title:"Override Swagger documentation"}]},{id:"graphql",title:"GraphQL Support",anchors:[{id:"overall-view",title:"Overall View"},{id:"enabling-graphql",title:"Enabling GraphQL"},{id:"graphiql",title:"GraphiQL"}]},{id:"serialization",title:"The Serialization Process",anchors:[{id:"overall-process",title:"Overall Process"},{id:"available-serializers",title:"Available Serializers"},{id:"decorating-a-serializer-and-add-extra-data",title:"Decorating a Serializer and Add Extra Data"}]},{id:"dto",title:"Handling Data Transfer Objects (DTOs)",anchors:null}]}},{node:{title:"The Schema Generator Component",path:"schema-generator",items:[{id:"index",title:"Introduction",anchors:null},{id:"getting-started",title:"Getting Started",anchors:null},{id:"configuration",title:"Configuration",anchors:null}]}},{node:{title:"The Admin Component",path:"admin",items:[{id:"index",title:"Introduction",anchors:[{id:"features",title:"Features"}]},{id:"getting-started",title:"Getting Started",anchors:[{id:"installation",title:"Installation"},{id:"creating-the-admin",title:"Creating the Admin"},{id:"customizing-the-admin",title:"Customizing the Admin"}]},{id:"authentication-support",title:"Authentication Support",anchors:null},{id:"handling-relations-to-collections",title:"Handling Relations to Collections",anchors:[{id:"using-an-autocomplete-input-for-relations",title:"Using an Autocomplete Input for Relations"}]}]}},{node:{title:"The Client Generator Component",path:"client-generator",items:[{id:"index",title:"Introduction",anchors:[{id:"features",title:"Features"}]},{id:"react",title:"React generator",anchors:null},{id:"vuejs",title:"Vue.js generator",anchors:null},{id:"troubleshooting",title:"Troubleshooting",anchors:null}]}},{node:{title:"Deployment",path:"deployment",items:[{id:"index",title:"Introduction",anchors:null},{id:"kubernetes",title:"Deploying to a Kubernetes Cluster",anchors:null},{id:"heroku",title:"Deploying an API Platform App on Heroku",anchors:null}]}},{node:{title:"Extra",path:"extra",items:[{id:"philosophy",title:"The Project's Philosophy",anchors:null},{id:"troubleshooting",title:"Troubleshooting",anchors:null},{id:"contribution-guides",title:"Contribution Guides",anchors:null},{id:"conduct",title:"Contributor Code Of Conduct",anchors:null}]}}]}},pathContext:{path:"docs/core/form-data",current:{path:"docs/core/form-data",title:"The API Component - Accept application/x-www-form-urlencoded Form Data"},prev:{path:"docs/core/operation-path-naming",title:"Operation Path Naming",rootPath:"The API Component"},next:{path:"docs/core/fosuser-bundle",title:"FOSUserBundle Integration",rootPath:"The API Component"}}}}});
//# sourceMappingURL=path---docs-core-form-data-357f9bf14597ced9bbe3.js.map