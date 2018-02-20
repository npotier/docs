webpackJsonp([76038511087769],{395:function(n,a){n.exports={data:{post:{html:'<h1 id="handling-data-transfer-objects-dtos"><a href="#handling-data-transfer-objects-dtos" aria-hidden="true" class="anchor"><svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>Handling Data Transfer Objects (DTOs)</h1>\n<h2 id="how-to-use-a-dto-for-writing"><a href="#how-to-use-a-dto-for-writing" aria-hidden="true" class="anchor"><svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>How to use a DTO for Writing</h2>\n<p>Sometimes it\'s easier to use a DTO than an Entity when performing simple\noperation. For example, the application should be able to send an email when\nsomeone has lost its password.</p>\n<p>So let\'s create a basic DTO for this request:</p>\n<div class="gatsby-highlight">\n      <pre class="language-php"><code><span class="token comment">// api/src/Api/Dto/ForgotPasswordRequest.php</span>\n\n<span class="token keyword">namespace</span> <span class="token package">App<span class="token punctuation">\\</span>Api<span class="token punctuation">\\</span>Dto</span><span class="token punctuation">;</span>\n\n<span class="token keyword">use</span> <span class="token package">ApiPlatform<span class="token punctuation">\\</span>Core<span class="token punctuation">\\</span>Annotation<span class="token punctuation">\\</span>ApiResource</span><span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">Symfony<span class="token punctuation">\\</span>Component<span class="token punctuation">\\</span>Validator<span class="token punctuation">\\</span>Constraints</span> <span class="token keyword">as</span> Assert<span class="token punctuation">;</span>\n\n<span class="token comment">/**\n * @ApiResource(\n *      collectionOperations={\n *          "post"={\n *              "path"="/users/forgot-password-request",\n *          },\n *      },\n *      itemOperations={},\n * )\n */</span>\n<span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">ForgotPasswordRequest</span>\n<span class="token punctuation">{</span>\n    <span class="token comment">/**\n     * @Assert\\NotBlank\n     * @Assert\\Email\n     */</span>\n    <span class="token keyword">public</span> <span class="token variable">$email</span><span class="token punctuation">;</span>\n<span class="token punctuation">}</span>\n</code></pre>\n      </div>\n<p>In this case, we disable all operations except <code>POST</code>.</p>\n<p>Then, thanks to <a href="/docs/core/events">the event system</a>, it\'s possible to intercept the\n<code>POST</code> request and to handle it.</p>\n<p>First, we should define a custom loader paths and create an event subscriber:</p>\n<ul>\n<li>define a custom loader paths for <code>Api/Dto</code>:</li>\n</ul>\n<div class="gatsby-highlight">\n      <pre class="language-yaml"><code><span class="token key atrule">api_platform</span><span class="token punctuation">:</span>\n    <span class="token key atrule">mapping</span><span class="token punctuation">:</span>\n        <span class="token key atrule">paths</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">\'%kernel.project_dir%/src/Api/Dto\'</span><span class="token punctuation">]</span>\n</code></pre>\n      </div>\n<ul>\n<li>create an event subscriber:</li>\n</ul>\n<div class="gatsby-highlight">\n      <pre class="language-php"><code><span class="token delimiter important">&lt;?php</span>\n<span class="token comment">// api/src/Api/EventSubscriber/UserSubscriber.php</span>\n\n<span class="token keyword">namespace</span> <span class="token package">App<span class="token punctuation">\\</span>Api<span class="token punctuation">\\</span>EventSubscriber</span><span class="token punctuation">;</span>\n\n<span class="token keyword">use</span> <span class="token package">ApiPlatform<span class="token punctuation">\\</span>Core<span class="token punctuation">\\</span>EventListener<span class="token punctuation">\\</span>EventPriorities</span><span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">App<span class="token punctuation">\\</span>Entity<span class="token punctuation">\\</span>User</span><span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">App<span class="token punctuation">\\</span>Manager<span class="token punctuation">\\</span>UserManager</span><span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">Symfony<span class="token punctuation">\\</span>Component<span class="token punctuation">\\</span>EventDispatcher<span class="token punctuation">\\</span>EventSubscriberInterface</span><span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">Symfony<span class="token punctuation">\\</span>Component<span class="token punctuation">\\</span>HttpFoundation<span class="token punctuation">\\</span>JsonResponse</span><span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">Symfony<span class="token punctuation">\\</span>Component<span class="token punctuation">\\</span>HttpKernel<span class="token punctuation">\\</span>Event<span class="token punctuation">\\</span>GetResponseForControllerResultEvent</span><span class="token punctuation">;</span>\n<span class="token keyword">use</span> <span class="token package">Symfony<span class="token punctuation">\\</span>Component<span class="token punctuation">\\</span>HttpKernel<span class="token punctuation">\\</span>KernelEvents</span><span class="token punctuation">;</span>\n\n<span class="token keyword">final</span> <span class="token keyword">class</span> <span class="token class-name">UserSubscriber</span> <span class="token keyword">implements</span> <span class="token class-name">EventSubscriberInterface</span>\n<span class="token punctuation">{</span>\n    <span class="token keyword">private</span> <span class="token variable">$userManager</span><span class="token punctuation">;</span>\n\n    <span class="token keyword">public</span> <span class="token keyword">function</span> <span class="token function">__construct</span><span class="token punctuation">(</span>UserManager <span class="token variable">$userManager</span><span class="token punctuation">)</span>\n    <span class="token punctuation">{</span>\n        <span class="token variable">$this</span><span class="token operator">-</span><span class="token operator">></span><span class="token property">userManager</span> <span class="token operator">=</span> <span class="token variable">$userManager</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n\n    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">function</span> <span class="token function">getSubscribedEvents</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n    <span class="token punctuation">{</span>\n        <span class="token keyword">return</span> <span class="token punctuation">[</span>\n            KernelEvents<span class="token punctuation">:</span><span class="token punctuation">:</span><span class="token constant">VIEW</span> <span class="token operator">=</span><span class="token operator">></span> <span class="token punctuation">[</span><span class="token string">\'sendPasswordReset\'</span><span class="token punctuation">,</span> EventPriorities<span class="token punctuation">:</span><span class="token punctuation">:</span><span class="token constant">POST_VALIDATE</span><span class="token punctuation">]</span><span class="token punctuation">,</span>\n        <span class="token punctuation">]</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n\n    <span class="token keyword">public</span> <span class="token keyword">function</span> <span class="token function">sendPasswordReset</span><span class="token punctuation">(</span>GetResponseForControllerResultEvent <span class="token variable">$event</span><span class="token punctuation">)</span>\n    <span class="token punctuation">{</span>\n        <span class="token variable">$request</span> <span class="token operator">=</span> <span class="token variable">$event</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">getRequest</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token string">\'api_forgot_password_requests_post_collection\'</span> <span class="token operator">!==</span> <span class="token variable">$request</span><span class="token operator">-</span><span class="token operator">></span><span class="token property">attributes</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">get</span><span class="token punctuation">(</span><span class="token string">\'_route\'</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token keyword">return</span><span class="token punctuation">;</span>\n        <span class="token punctuation">}</span>\n\n        <span class="token variable">$forgotPasswordRequest</span> <span class="token operator">=</span> <span class="token variable">$event</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">getControllerResult</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n        <span class="token variable">$user</span> <span class="token operator">=</span> <span class="token variable">$this</span><span class="token operator">-</span><span class="token operator">></span><span class="token property">userManager</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">findOneByEmail</span><span class="token punctuation">(</span><span class="token variable">$forgotPasswordRequest</span><span class="token operator">-</span><span class="token operator">></span><span class="token property">email</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n        <span class="token comment">// We do nothing if the user does not exist in the database</span>\n        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token variable">$user</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n            <span class="token variable">$this</span><span class="token operator">-</span><span class="token operator">></span><span class="token property">userManager</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">requestPasswordReset</span><span class="token punctuation">(</span><span class="token variable">$user</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n        <span class="token punctuation">}</span>\n\n        <span class="token variable">$event</span><span class="token operator">-</span><span class="token operator">></span><span class="token function">setResponse</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">JsonResponse</span><span class="token punctuation">(</span><span class="token keyword">null</span><span class="token punctuation">,</span> <span class="token number">204</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n    <span class="token punctuation">}</span>\n<span class="token punctuation">}</span>\n</code></pre>\n      </div>\n<p>Then this class should be registered as a service, then tagged.</p>\n<p>If service autowiring and autoconfiguration are enabled (it\'s the case by\ndefault), you are done!</p>\n<p>Otherwise, the following configuration is needed:</p>\n<div class="gatsby-highlight">\n      <pre class="language-yaml"><code><span class="token comment"># api/config/services.yaml</span>\n<span class="token key atrule">services</span><span class="token punctuation">:</span>\n    <span class="token comment"># ...</span>\n    <span class="token key atrule">\'App\\Api\\EventSubscriber\\UserSubscriber\'</span><span class="token punctuation">:</span>\n        <span class="token key atrule">arguments</span><span class="token punctuation">:</span>\n            <span class="token punctuation">-</span> <span class="token string">\'@app.manager.user\'</span>\n        <span class="token comment"># Uncomment the following line only if you don\'t use autoconfiguration</span>\n        <span class="token comment">#tags: [ \'kernel.event_subscriber\' ]</span>\n</code></pre>\n      </div>'},navDoc:{edges:[{node:{title:"The Distribution",path:"distribution",items:[{id:"index",title:"Creating a Fully Featured API in 5 Minutes",anchors:null},{id:"testing",title:"Testing and Specifying the API",anchors:null}]}},{node:{title:"The API Component",path:"core",items:[{id:"index",title:"Introduction",anchors:null},{id:"getting-started",title:"Getting Started",anchors:[{id:"installing-api-platform-core",title:"Installing API Platform Core"},{id:"before-reading-this-documentation",title:"Before Reading this Documentation"},{id:"mapping-the-entities",title:"Mapping the Entities"}]},{id:"configuration",title:"Configuration",anchors:null},{id:"operations",title:"Operations",anchors:[{id:"enabling-and-disabling-operations",title:"Enabling and Disabling Operations"},{id:"configuring-operations",title:"Configuring Operations"},{id:"subresources",title:"Subresources"},{id:"creating-custom-operations-and-controllers",title:"Creating Custom Operations and Controllers"}]},{id:"default-order",title:"Overriding Default Order",anchors:null},{id:"filters",title:"Filters",anchors:[{id:"doctrine-orm-filters",title:"Doctrine ORM Filters"},{id:"serializer-filters",title:"Serializer Filters"},{id:"creating-custom-filters",title:"Creating Custom Filters"},{id:"apifilter-annotation",title:"ApiFilter Annotation"}]},{id:"serialization",title:"The Serialization Process",anchors:[{id:"overall-process",title:"Overall Process"},{id:"available-serializers",title:"Available Serializers"},{id:"the-serialization-context-groups-and-relations",title:"The Serialization Context, Groups and Relations"},{id:"using-serialization-groups",title:"Using Serialization Groups"},{id:"using-different-serialization-groups-per-operation",title:"Using Different Serialization Groups per Operation"},{id:"changing-the-serialization-context-dynamically",title:"Changing the Serialization Context Dynamically"},{id:"changing-the-serialization-context-on-a-per-item-basis",title:"Changing the Serialization Context on a Per Item Basis"},{id:"name-conversion",title:"Name Conversion"},{id:"decorating-a-serializer-and-add-extra-data",title:"Decorating a Serializer and Add Extra Data"},{id:"entity-identifier-case",title:"Entity Identifier Case"},{id:"embedding-the-json-ld-context",title:"Embedding the JSON-LD Context"}]},{id:"validation",title:"Validation",anchors:[{id:"using-validation-groups",title:"Using Validation Groups"},{id:"dynamic-validation-groups",title:"Dynamic Validation Groups"},{id:"error-levels-and-payload-serialization",title:"Error Levels and Payload Serialization"}]},{id:"pagination",title:"Pagination",anchors:[{id:"disabling-the-pagination",title:"Disabling the Pagination"},{id:"changing-the-number-of-items-per-page",title:"Changing the Number of Items per Page"},{id:"partial-pagination",title:"Partial Pagination"}]},{id:"events",title:"The Event System",anchors:null},{id:"content-negotiation",title:"Content Negotiation",anchors:[{id:"enabling-several-formats",title:"Enabling Several Formats"},{id:"registering-a-custom-serializer",title:"Registering a Custom Serializer"},{id:"creating-a-responder",title:"Creating a Responder"},{id:"writing-a-custom-normalizer",title:"Writing a Custom Normalizer"}]},{id:"external-vocabularies",title:"Using External JSON-LD Vocabularies",anchors:null},{id:"extending-jsonld-context",title:"Extending JSON-LD context",anchors:null},{id:"data-providers",title:"Data Providers",anchors:[{id:"custom-collection-data-provider",title:"Custom Collection Data Provider"},{id:"custom-item-data-provider",title:"Custom Item Data Provider"},{id:"injecting-the-serializer-in-an-itemdataprovider",title:'Injecting the Serializer in an "ItemDataProvider"'}]},{id:"extensions",title:"Extensions",anchors:[{id:"custom-extension",title:"Custom Extension"},{id:"example",title:"Filter upon the current user"}]},{id:"security",title:"Security",anchors:null},{id:"performance",title:"Performance",anchors:[{id:"enabling-the-builtin-http-cache-invalidation-system",title:"Enabling the Builtin HTTP Cache Invalidation System"},{id:"enabling-the-metadata-cache",title:"Enabling the Metadata Cache"},{id:"using-ppm-php-pm",title:"Using PPM (PHP-PM)"},{id:"doctrine-queries-and-indexes",title:"Doctrine Queries and Indexes"}]},{id:"operation-path-naming",title:"Operation Path Naming",anchors:[{id:"configuration",title:"Configuration"},{id:"create-a-custom-operation-path-resolver",title:"Create a Custom Operation Path Naming"}]},{id:"form-data",title:"Accept application/x-www-form-urlencoded Form Data",anchors:null},{id:"fosuser-bundle",title:"FOSUserBundle Integration",anchors:[{id:"installing-the-bundle",title:"Installing the Bundle"},{id:"enabling-the-bridge",title:"Enabling the Bridge"},{id:"creating-a-user-entity-with-serialization-groups",title:'Creating a "User" Entity with Serialization Groups'}]},{id:"jwt",title:"Adding a JWT authentication using LexikJWTAuthenticationBundle",anchors:[{id:"testing-with-swagger",title:"Testing with Swagger"},{id:"testing-with-behat",title:"Testing with Behat"}]},{id:"nelmio-api-doc",title:"NelmioApiDocBundle integration",anchors:null},{id:"angularjs-integration",title:"AngularJS Integration",anchors:[{id:"restangular",title:"Restangular"},{id:"ng-admin",title:"ng-admin"}]},{id:"swagger",title:"Swagger Support",anchors:[{id:"override-swagger-documentation",title:"Override Swagger documentation"}]},{id:"graphql",title:"GraphQL Support",anchors:[{id:"overall-view",title:"Overall View"},{id:"enabling-graphql",title:"Enabling GraphQL"},{id:"graphiql",title:"GraphiQL"}]},{id:"serialization",title:"The Serialization Process",anchors:[{id:"overall-process",title:"Overall Process"},{id:"available-serializers",title:"Available Serializers"},{id:"decorating-a-serializer-and-add-extra-data",title:"Decorating a Serializer and Add Extra Data"}]},{id:"dto",title:"Handling Data Transfer Objects (DTOs)",anchors:null}]}},{node:{title:"The Schema Generator Component",path:"schema-generator",items:[{id:"index",title:"Introduction",anchors:null},{id:"getting-started",title:"Getting Started",anchors:null},{id:"configuration",title:"Configuration",anchors:null}]}},{node:{title:"The Admin Component",path:"admin",items:[{id:"index",title:"Introduction",anchors:[{id:"features",title:"Features"}]},{id:"getting-started",title:"Getting Started",anchors:[{id:"installation",title:"Installation"},{id:"creating-the-admin",title:"Creating the Admin"},{id:"customizing-the-admin",title:"Customizing the Admin"}]},{id:"authentication-support",title:"Authentication Support",anchors:null},{id:"handling-relations-to-collections",title:"Handling Relations to Collections",anchors:[{id:"using-an-autocomplete-input-for-relations",title:"Using an Autocomplete Input for Relations"}]}]}},{node:{title:"The Client Generator Component",path:"client-generator",items:[{id:"index",title:"Introduction",anchors:[{id:"features",title:"Features"}]},{id:"react",title:"React generator",anchors:null},{id:"vuejs",title:"Vue.js generator",anchors:null},{id:"troubleshooting",title:"Troubleshooting",anchors:null}]}},{node:{title:"Deployment",path:"deployment",items:[{id:"index",title:"Introduction",anchors:null},{id:"kubernetes",title:"Deploying to a Kubernetes Cluster",anchors:null},{id:"heroku",title:"Deploying an API Platform App on Heroku",anchors:null}]}},{node:{title:"Extra",path:"extra",items:[{id:"philosophy",title:"The Project's Philosophy",anchors:null},{id:"troubleshooting",title:"Troubleshooting",anchors:null},{id:"contribution-guides",title:"Contribution Guides",anchors:null},{id:"conduct",title:"Contributor Code Of Conduct",anchors:null}]}}]}},pathContext:{path:"docs/core/dto",current:{path:"docs/core/dto",title:"The API Component - Handling Data Transfer Objects (DTOs)"},prev:{path:"docs/core/serialization",title:"The Serialization Process",rootPath:"The API Component"},next:{path:"docs/schema-generator/index",title:"The Schema Generator Component - Introduction"}}}}});
//# sourceMappingURL=path---docs-core-dto-caace9e264680c20bff0.js.map