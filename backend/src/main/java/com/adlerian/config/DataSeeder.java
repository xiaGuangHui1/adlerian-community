package com.adlerian.config;

import com.adlerian.entity.Post;
import com.adlerian.entity.InterestCircle;
import com.adlerian.entity.CirclePost;
import com.adlerian.entity.Resource;
import com.adlerian.entity.User;
import com.adlerian.repository.PostRepository;
import com.adlerian.repository.InterestCircleRepository;
import com.adlerian.repository.CirclePostRepository;
import com.adlerian.repository.ResourceRepository;
import com.adlerian.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 应用启动时自动检查并填充 mock 数据。仅当对应表为空时才写入，
 * 避免覆盖已有数据。
 * 启动异常不阻塞应用——seeder 失败时只记录日志，不会导致启动崩溃。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final PostRepository postRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final InterestCircleRepository interestCircleRepository;
    private final CirclePostRepository circlePostRepository;

    @Override
    public void run(String... args) {
        try {
            seedResources();
        } catch (Exception e) {
            log.warn("Failed to seed resources (app will continue): {}", e.getMessage());
        }
        try {
            seedPosts();
        } catch (Exception e) {
            log.warn("Failed to seed posts (app will continue): {}", e.getMessage());
        }
        try {
            seedCircles();
        } catch (Exception e) {
            log.warn("Failed to seed circles (app will continue): {}", e.getMessage());
        }
        try {
            seedCirclePosts();
        } catch (Exception e) {
            log.warn("Failed to seed circle posts (app will continue): {}", e.getMessage());
        }
    }

    private void seedResources() {
        List<Resource> resources = List.of(
            // ========== 核心概念 (concept) ==========
            Resource.builder().title("自卑感与超越").description("阿德勒心理学的基石概念，探讨自卑感的本质与转化").type("concept")
                .content("每个人都有自卑感，这是人类进步的动力。自卑感本身不是问题，问题在于我们如何面对它。健康的自卑感驱动我们成长，自卑情结则是逃避的借口。")
                .sortOrder(1).createdAt(Instant.now()).build(),
            Resource.builder().title("课题分离").description("区分自己的课题和他人的课题，获得真正的自由").type("concept")
                .content("核心问题：这件事最终的后果由谁来承担？不干涉他人的课题，也不让他人干涉自己的课题。课题分离不是冷漠，而是尊重彼此的独立性。")
                .sortOrder(2).createdAt(Instant.now()).build(),
            Resource.builder().title("共同体感觉").description("幸福的真正源泉——归属感与贡献感").type("concept")
                .content("阿德勒认为幸福的关键在于共同体感觉——感觉自己属于一个共同体并愿意为之贡献。三个要素：自我接纳、他者信赖、他者贡献。")
                .sortOrder(3).createdAt(Instant.now()).build(),
            Resource.builder().title("横向关系与纵向关系").description("建立平等的人际关系，告别支配与被支配").type("concept")
                .content("阿德勒主张人际关系应该是横向的（平等的），而非纵向的（上下之分）。用鼓励替代表扬，用感谢替代评判。在横向关系中，每个人都是独立而平等的个体。")
                .sortOrder(4).createdAt(Instant.now()).build(),
            Resource.builder().title("目的论：行为由目的驱动").description("重新审视你的选择，而非归咎于过去").type("concept")
                .content("阿德勒反对原因论。我们不是被过去决定的，而是为了某种目的选择了现在的行为。既然是自己选择的，就可以做出新的选择。把注意力从'为什么'转向'为了什么'，你就能看到改变的路径。")
                .sortOrder(5).createdAt(Instant.now()).build(),
            Resource.builder().title("生活风格：你的行为模式").description("理解并改变你独特的思维和行动模式").type("concept")
                .content("生活风格是幼年形成的对自我和世界的根本看法。它影响我们所有的思维和行为——但它是可以改变的。人有自我决定的能力，关键在于觉察自己的模式，并做出新的选择。")
                .sortOrder(6).createdAt(Instant.now()).build(),
            Resource.builder().title("社会兴趣：与他人和世界的连接").description("阿德勒心理学最核心的概念之一").type("concept")
                .content("社会兴趣（Gemeinschaftsgefühl）是阿德勒衡量心理健康的核心标准。它包含对他人的关怀、对社会的参与、对共同体的贡献。社会兴趣越强的人，心理健康水平越高，幸福感也越强。")
                .sortOrder(7).createdAt(Instant.now()).build(),
            Resource.builder().title("鼓励与勇气").description("鼓励不是表扬，而是赋予勇气的过程").type("concept")
                .content("阿德勒认为教育的核心是赋予人勇气。表扬是纵向关系的产物（'你做得好，我认可你'），而鼓励是横向关系的表达（'我看到了你的努力'）。真正的鼓励让人从内心生发出行动的勇气。")
                .sortOrder(8).createdAt(Instant.now()).build(),

            // ========== 阿德勒生平 (bio) ==========
            Resource.builder().title("阿尔弗雷德·阿德勒：从自卑少年到心理学大师").description("阿德勒的生平故事与他思想的渊源").type("bio")
                .content("阿德勒1870年出生于维也纳一个犹太家庭。他幼年体弱多病，5岁时因肺炎险些丧命，这段经历是他选择医学的重要动因。他还患有佝偻病，是班上最矮小的孩子之一，这些早期的自卑体验深刻地影响了他后来的理论。\n\n从维也纳大学医学系毕业后，他先是眼科医生，后转向精神医学。1902年应弗洛伊德邀请加入'星期三心理学会'，但与弗洛伊德在1911年决裂，创立了自己的'个体心理学'。\n\n阿德勒的理论强调人的社会性、主观能动性和对意义的追求。他反对弗洛伊德的性本能决定论，认为人的行为是由对未来的目标和对优越的追求驱动的。")
                .sortOrder(21).createdAt(Instant.now()).build(),
            Resource.builder().title("个体心理学的诞生：与弗洛伊德的决裂").description("为什么阿德勒要离开弗洛伊德，创建自己的学派？").type("bio")
                .content("1911年，在维也纳精神分析学会的一次会议上，阿德勒发表了一篇激进的文章，声称女性的心理问题不应该简单地归结为'阴茎羡慕'，而是社会地位不平等的产物。\n\n这彻底激怒了弗洛伊德。两人之间的分歧早已存在：弗洛伊德认为人的行为由性本能和童年创伤决定，而阿德勒认为人是主动的创造者，行为由对未来的目标和追求优越所驱动。\n\n决裂后，阿德勒创立了'个体心理学'。他的理论强调整体性（人是不可分割的整体）、目的性（行为指向未来）、社会性（人本质上是社会存在）。这些思想至今影响深远。")
                .sortOrder(22).createdAt(Instant.now()).build(),
            Resource.builder().title("阿德勒的教育实践：儿童指导中心").description("从理论到实践，阿德勒如何改变教育").type("bio")
                .content("阿德勒不仅是一位理论家，更是一位实践者。20世纪20年代，他在维也纳建立了30多所儿童指导中心，为教师和家长提供咨询服务。\n\n这些中心的做法在当时非常超前：\n1. 公开咨询——咨询过程对现场所有人可见，成为一种教育示范\n2. 面向教师和家长——阿德勒认为改变孩子的环境比改变孩子本身更重要\n3. 鼓励而非批评——帮助孩子发现自己的优势，培养自信和勇气\n\n这些做法后来影响了全世界的教育理念，特别是正面管教和鼓励式教育。")
                .sortOrder(23).createdAt(Instant.now()).build(),
            Resource.builder().title("晚年与遗产：在全世界传播个体心理学").description("一战后的阿德勒与个体心理学的全球影响").type("bio")
                .content("第一次世界大战期间，阿德勒作为军医目睹了战争的残酷，这加深了他对和平与人类合作重要性的信念。战后，他将个体心理学的研究重心转向教育和社会改革。\n\n1926年，阿德勒首次访问美国，在哥伦比亚大学和哈佛大学等名校讲学。1932年成为纽约长岛医学院的客座教授。\n\n1937年5月28日，阿德勒在苏格兰阿伯丁讲学途中因心脏病突发去世，享年67岁。尽管他的知名度一度不如弗洛伊德和荣格，但他的思想通过正面管教、积极心理学等现代运动得到了复兴。")
                .sortOrder(24).createdAt(Instant.now()).build(),

            // ========== 经典引述 (quote) ==========
            Resource.builder().title("「重要的不是被给予了什么，而是如何去利用被给予的东西。」").description("解读阿德勒最著名的一句话").type("quote")
                .content("这句话出自岸见一郎的《被讨厌的勇气》，是对阿德勒思想最精炼的概括之一。\n\n核心含义：我们的出身、性格、过去的经历都是'被给予的'，但我们赋予这些经历什么样的意义、如何利用它们去创造未来，是我们可以选择的。\n\n实践启示：不要再为过去找借口。你不是你的过去，你是你对过去的解释。把注意力从'我为什么变成这样'转向'我可以成为什么样'，人生的方向盘就在你自己手里。")
                .sortOrder(41).createdAt(Instant.now()).build(),
            Resource.builder().title("「人的烦恼皆源于人际关系。」").description("为什么阿德勒说烦恼源于人际关系？").type("quote")
                .content("这是阿德勒最深刻的洞察之一。他认为，如果世界上只有一个人，就不会产生任何烦恼。所有的烦恼——自卑、嫉妒、愤怒、焦虑——都与他人有关。\n\n但这并不意味着要逃避人际关系。恰恰相反，阿德勒认为人的幸福也源于人际关系——通过建立横向的、平等的人际关系，通过对他人的贡献获得归属感。\n\n烦恼的根源不在于关系本身，而在于我们在关系中处于纵向位置（比较、竞争、评判）。建立横向关系，是解决人际关系烦恼的根本之道。")
                .sortOrder(42).createdAt(Instant.now()).build(),
            Resource.builder().title("「所谓自由，就是被别人讨厌。」").description("为什么真正的自由需要勇气？").type("quote")
                .content("这句话出自《被讨厌的勇气》，是阿德勒思想中最具冲击力的表达之一。\n\n含义解读：当你试图取悦所有人时，你就失去了自己。活在别人的期待中是一种不自由，因为你把评判自己的权利交给了别人。真正的自由意味着你按照自己的课题生活，即使这会让某些人不高兴。\n\n这不是鼓励你去故意惹人讨厌，而是说：如果你想做真实的自己，就不可能满足所有人的期待。被讨厌的勇气，就是选择做自己的勇气。")
                .sortOrder(43).createdAt(Instant.now()).build(),
            Resource.builder().title("「健全的自卑感不是来自与他人的比较，而是来自与理想自己的比较。」").description("如何正确看待自卑感？").type("quote")
                .content("阿德勒区分了两种自卑感：不健康的自卑感来自于和他人的比较（'我不如他'），而健全的自卑感来自于与自己理想的比较（'我还不够好，但我可以更好'）。\n\n前者让人陷入嫉妒、焦虑和自我否定，后者则成为成长的动力。关键不在于消除自卑感（那是不可能的），而在于把比较的对象从他人转向自己。今天的你比昨天进步了一点点，这就是健全的自卑感在发挥作用。")
                .sortOrder(44).createdAt(Instant.now()).build(),
            Resource.builder().title("「人生不是一条线，而是一连串的瞬间。」").description("活在当下的哲学").type("quote")
                .content("这句话挑战了我们惯常的'线性人生'观念。我们总觉得人生像一条从出生到死亡的路，每一步都是为了到达某个终点。但阿德勒说，人生的意义不在于终点，而在于每一个此时此刻。\n\n如果你总在等待'某天'开始真正的生活——等考上大学、等工作了、等退休了——那么你将永远错过生活的本质。活在当下不是放弃计划，而是不再把当下当做通往未来的跳板。此时此刻，就是人生。")
                .sortOrder(45).createdAt(Instant.now()).build(),

            // ========== 推荐阅读 (book) ==========
            Resource.builder().title("《被讨厌的勇气》").description("岸见一郎 / 古贺史健 | 阿德勒心理学入门必读").type("book")
                .content("以对话体的形式，深入浅出地介绍阿德勒心理学的核心思想。通过一位青年与哲学家的对话，探讨自由、幸福、人际关系等根本问题。被誉为改变人生的哲学课。")
                .sortOrder(61).createdAt(Instant.now()).build(),
            Resource.builder().title("《自卑与超越》").description("阿尔弗雷德·阿德勒 | 阿德勒的代表作").type("book")
                .content("阿德勒亲自撰写的经典著作，系统阐述了个体心理学的核心理论。涵盖自卑感、社会兴趣、生活风格、生活任务等核心概念。了解阿德勒心理学的源头。")
                .sortOrder(62).createdAt(Instant.now()).build(),
            Resource.builder().title("《幸福的勇气》").description("岸见一郎 / 古贺史健 | 《被讨厌的勇气》续作").type("book")
                .content("继《被讨厌的勇气》之后，青年再次来到哲学家的书房。这次对话聚焦于如何在现实中实践阿德勒心理学，特别是在教育和人际关系中的应用。从理论到实践的重要桥梁。")
                .sortOrder(63).createdAt(Instant.now()).build(),
            Resource.builder().title("《儿童的人格形成及其教育》").description("阿尔弗雷德·阿德勒 | 教育心理学经典").type("book")
                .content("阿德勒关于儿童教育的经典著作。探讨儿童人格的形成过程，以及如何通过正确的教育方式帮助儿童健康成长。对育儿和教育感兴趣的读者必读。")
                .sortOrder(64).createdAt(Instant.now()).build(),
            Resource.builder().title("《理解人性》").description("阿尔弗雷德·阿德勒 | 认识人性的必读之作").type("book")
                .content("阿德勒从个体心理学的角度系统阐述了他对人性的理解。探讨了性格的形成、社会感的培养、以及如何理解人的行为背后的目的。适合对心理学感兴趣的读者。")
                .sortOrder(65).createdAt(Instant.now()).build(),
            Resource.builder().title("《阿德勒心理学讲义》").description("阿尔弗雷德·阿德勒 | 最全面的阿德勒思想集").type("book")
                .content("汇集了阿德勒最重要的讲义和文章，全面覆盖个体心理学的各个方面。从自卑感到社会兴趣，从梦的解析到教育实践，展现了一位伟大心理学家思想的完整图景。")
                .sortOrder(66).createdAt(Instant.now()).build(),

            // ========== 实践指南 (practice) ==========
            Resource.builder().title("每日课题分离练习：三步法").description("在日常生活中练习课题分离的具体方法").type("practice")
                .content("课题分离是阿德勒心理学中最实用的工具，但也最容易被误解和误用。下面是三步练习法：\n\n**第一步：识别烦恼**\n当你感到焦虑、愤怒或压力时，暂停3秒问自己：'现在我正在为谁的课题而烦恼？'\n\n**第二步：判断归属**\n核心判断标准：这件事的最终后果由谁来承担？\n- 如果是别人承担后果 → 别人的课题，你只能提供支持\n- 如果是自己承担后果 → 自己的课题，需要主动面对\n\n**第三步：采取行动**\n- 别人的课题：给出建议（如果需要），然后放下\n- 自己的课题：制定行动计划，做你能控制的事情\n\n**今日练习**：找一件你最近为之烦恼的事情，用三步法分析。")
                .sortOrder(81).createdAt(Instant.now()).build(),
            Resource.builder().title("建立横向关系的5个日常习惯").description("告别纵向关系，在日常生活中练习平等交流").type("practice")
                .content("阿德勒认为人际关系应该建立在横向关系（平等）而非纵向关系（上下）的基础上。以下是5个可以立即开始的练习：\n\n1. **用感谢替代表扬**：不说'你真棒'，说'谢谢你的帮助'\n2. **停止比较**：不再说'你看看别人'，改为关注每个人自己的进步\n3. **平等地表达意见**：对孩子/下属用同样的尊重语气，不居高临下\n4. **鼓励过程而非结果**：'我看到你这周一直在努力'比'你考了第一名'更有力量\n5. **练习'我信息'**：不说'你让我生气了'，说'我感到有些不舒服'\n\n本周选择一个习惯开始练习，每天记录自己的进步。")
                .sortOrder(82).createdAt(Instant.now()).build(),
            Resource.builder().title("如何应对孩子的自卑感：阿德勒式育儿指南").description("用鼓励代替批评，培养孩子的勇气").type("practice")
                .content("孩子经常说'我不会'、'我不行'、'别人都比我好'——这些都是自卑感的表现。阿德勒式育儿提供了一套与传统文化完全不同的应对方式：\n\n**不要做：**\n- 否定孩子的感受：'你一点也不差啊'\n- 横向比较：'你看隔壁小明多好'\n- 替孩子解决问题\n\n**应该做：**\n- 接纳孩子的感受：'我理解你现在觉得很沮丧'\n- 关注孩子的付出：'我看到你已经练习了很多次'\n- 引导自我比较：'比上周进步了很多，对吗？'\n- 允许失败：'做不到也没关系，我们可以再试试'\n\n阿德勒说：教育的目标不是培养不犯错的孩子，而是培养不怕犯错的勇气。")
                .sortOrder(83).createdAt(Instant.now()).build(),
            Resource.builder().title("停止内耗的4个阿德勒心理学工具").description("用阿德勒的方法减少精神内耗").type("practice")
                .content("精神内耗（想太多、犹豫不决、自我否定）是许多人的困扰。以下是4个基于阿德勒心理学的实用工具：\n\n**工具1：课题分离清单**\n写下让你焦虑的所有事情，逐条标注'这是我的课题吗？'。把不是自己的划掉。\n\n**工具2：目的觉察日记**\n每次陷入负面情绪时记录：'我选择这个情绪/行为的目的是什么？我想回避什么？'\n\n**工具3：'做到'清单**\n不再写to-do list，改为写done list——记下你已经做到的事情。\n\n**工具4：共同体扩大练习**\n每天做一件让别人（哪怕只是一个人）受益的小事。贡献感是对抗内耗最好的武器。")
                .sortOrder(84).createdAt(Instant.now()).build(),
            Resource.builder().title("在职场中实践课题分离：边界感养成指南").description("用阿德勒的方法建立健康的职场边界").type("practice")
                .content("职场是最需要课题分离的场所，也是最难实践的地方。以下是一个系统的练习：\n\n**对同事的课题分离：**\n- 同事的工作结果是他的课题，你的帮助是选择不是义务\n- 学会温和而坚定地表达边界：'这个我现在帮不了，不过可以帮你找资料'\n\n**对领导的课题分离：**\n- 领导的情绪是领导的课题\n- 你的表现是你的课题——做好工作即可，不需要为领导的焦虑负责\n\n**对自己的课题分离：**\n- 无法控制的事情（公司决策、经济环境）不是你该焦虑的\n- 能控制的事情（工作质量、学习成长）才是你的课题\n\n**本周练习**：每天找一件你过度负责的事，问自己'这真的是我的课题吗？'")
                .sortOrder(85).createdAt(Instant.now()).build(),
            Resource.builder().title("阿德勒式亲密关系：从竞争到合作").description("用横向关系重塑亲密关系的实践方法").type("practice")
                .content("最亲密的关系往往最容易陷入纵向关系的陷阱。以下是一个为期30天的关系重塑计划：\n\n**第一周：觉察**\n记录你和伴侣之间的对话，标注哪些是评判（'你总是...'）、哪些是比较（'别人都...'）、哪些是命令（'你应该...'）\n\n**第二周：转换**\n把评判换成观察：'我看到...'，把比较换成肯定：'我欣赏你...'，把命令换成邀请：'我们可以...'\n\n**第三周：贡献**\n每天做一件为对方贡献的事，不求回报\n\n**第四周：回顾与庆祝**\n回顾四周的变化，庆祝你们一起取得的进步\n\n记住：横向关系不是你改变他/她，而是你们选择不同的相处方式。")
                .sortOrder(86).createdAt(Instant.now()).build()
        );

        List<String> existingTitles = resourceRepository.findAll().stream()
                .map(Resource::getTitle)
                .toList();
        List<Resource> missing = resources.stream()
                .filter(r -> !existingTitles.contains(r.getTitle()))
                .toList();
        if (!missing.isEmpty()) {
            resourceRepository.saveAll(missing);
            log.info("Seeded {} new learning resources", missing.size());
        }
    }

    private void seedPosts() {
        if (postRepository.count() > 0) {
            log.info("Posts already exist ({} records), skipping seed", postRepository.count());
            return;
        }

        User author = userRepository.findAll().stream().findFirst().orElseGet(() -> {
            log.info("No users found, creating system user for seed data");
            User systemUser = User.builder()
                    .authId(UUID.fromString("a0000000-0000-0000-0000-000000000000"))
                    .nickname("阿德勒学长")
                    .bio("分享阿德勒心理学的思考与实践")
                    .createdAt(Instant.now())
                    .build();
            return userRepository.save(systemUser);
        });

        List<Post> posts = List.of(
            createPost(author, "课题分离",
                "life-courage",
                """
                最近在读《被讨厌的勇气》，课题分离这个概念让我豁然开朗。

                以前我总是在意别人的看法，担心别人怎么评价我。现在明白了：**别人怎么看我是别人的课题，我怎么活是我自己的课题**。

                当你真正实践课题分离，你会发现生活轻松了很多。不再内耗，不再纠结，把精力放在自己能改变的事情上。

                大家是怎么理解和实践课题分离的？"""),

            createPost(author, "如何减少内耗？分享一个简单的方法",
                "reduce-internal-friction",
                """
                最近发现一个减少内耗的好方法：**每天写下三件你已经做到的事情**，而不是三件你还没做的事。

                我们的大脑天生关注未完成的事项，这让我们持续焦虑。聚焦于已完成的事能激活成就感回路，减少内耗。

                我已经坚持一周了，感觉睡眠质量都变好了。推荐给大家试试！"""),

            createPost(author, "面对孩子的叛逆，我选择了不同的方式",
                "parent-child-conflict",
                """
                儿子上初中后变得很叛逆，说什么都不听。以前我会批评、讲道理，结果他更抗拒了。

                学了阿德勒心理学后，我改变了方式：
                1. 不再用命令的语气
                2. 给他选择的自由
                3. 允许他犯错，把后果作为学习机会

                最重要的是，我学会了课题分离——学习是他的课题，不是我的。我不再替他着急，只是提供支持和信任。

                现在我们的关系缓和了很多。虽然他还是会偷懒，但至少我们之间有真正的交流了。"""),

            createPost(author, "工作没有意义感怎么办？",
                "work-meaning",
                """
                在一家大公司做了五年，感觉越来越空虚。每天重复同样的事情，看不到成长。

                阿德勒说，**意义感来自于对他人的贡献**。或许问题不在于工作本身，而在于我怎么看待它。

                我试着把工作重新定义为"帮助同事和客户解决问题"。心态一转，感觉完全不同了。

                大家有类似的经验吗？怎么在平凡的工作中找到意义感？"""),

            createPost(author, "自卑不是缺陷，是成长的起点",
                "self-acceptance",
                """
                阿德勒说每个人都有自卑感，这是人类进步的动力。

                但要注意区分健康的自卑感和自卑情结：
                - 健康的自卑：我不够好→我要努力变得更好
                - 自卑情结：我不够好→所以我做不到

                关键不是消除自卑，而是**接纳它、利用它作为成长的动力**。

                你正处在哪种状态？"""),

            createPost(author, "改善亲密关系中的横向关系",
                "relationships",
                """
                在一段关系里，最容易陷入纵向关系的陷阱：谁对谁错、谁付出更多、谁该听谁的。

                阿德勒的横向关系理论让我重新审视亲密关系：

                **我们的关系不是竞争，是合作。**
                不是谁赢了谁，而是一起面对生活中的课题。

                开始尝试：
                - 用感谢替代表扬（因为你做到了而感谢，不是"我认可你"）
                - 一起做决定，而不是谁说服谁
                - 尊重对方的选择自由

                关系中，平等是最难的修行。"""),

            createPost(author, "分享一个情绪管理的心得",
                "emotional-confusion",
                """
                以前情绪上来觉得是别人的错——他让我生气、她让我难过。

                阿德勒的目的论说：**不是因为发生了什么才生气，而是为了某种目的选择了生气。**

                比如：我生气了，目的是让对方注意我、满足我的期待。

                现在情绪上来时，我会问自己：
                1. 我想要达成的目的是什么？
                2. 情绪能帮我达成这个目的吗？
                3. 有没有更好的方式？

                这个方法帮我平静了很多。"""),

            createPost(author, "从讨好型人格到建立健康的边界",
                "enhance-connection",
                """
                以前我是典型的讨好型人格，不会拒绝、害怕冲突、总是迁就别人。

                课题分离救了我：
                - 别人是否满意，是别人的课题
                - 我是否尊重自己的边界，是我的课题

                开始学会说"不"之后，不仅没有失去关系，反而获得了更多尊重。

                建立边界不是冷漠，是自爱的开始。大家都是怎么练习的？""")
        );

        postRepository.saveAll(posts);
        log.info("Seeded {} forum posts for user {}", posts.size(), author.getNickname());
    }

    private Post createPost(User author, String title, String category, String content) {
        return Post.builder()
                .author(author)
                .title(title)
                .content(content)
                .category(category)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    private void seedCircles() {
        if (interestCircleRepository.count() > 0) {
            log.info("Interest circles already exist ({} records), skipping seed", interestCircleRepository.count());
            return;
        }

        List<InterestCircle> circles = List.of(
            InterestCircle.builder()
                .name("阅读分享")
                .description("分享读书心得、推荐好书，在阅读中成长")
                .icon("📚")
                .sortOrder(1)
                .build(),
            InterestCircle.builder()
                .name("运动健身")
                .description("一起打卡运动，互相鼓励保持健康")
                .icon("💪")
                .sortOrder(2)
                .build(),
            InterestCircle.builder()
                .name("音乐艺术")
                .description("分享音乐、绘画、艺术创作的美好")
                .icon("🎵")
                .sortOrder(3)
                .build(),
            InterestCircle.builder()
                .name("编程技术")
                .description("交流编程技能、分享技术经验")
                .icon("💻")
                .sortOrder(4)
                .build(),
            InterestCircle.builder()
                .name("亲子育儿")
                .description("探讨育儿经验，陪伴孩子一起成长")
                .icon("👶")
                .sortOrder(5)
                .build(),
            InterestCircle.builder()
                .name("美食烹饪")
                .description("分享美食制作、交流烹饪技巧")
                .icon("🍳")
                .sortOrder(6)
                .build(),
            InterestCircle.builder()
                .name("旅行摄影")
                .description("分享旅行见闻和摄影作品")
                .icon("📷")
                .sortOrder(7)
                .build(),
            InterestCircle.builder()
                .name("电影动漫")
                .description("聊聊电影、动漫，分享观影心得")
                .icon("🎬")
                .sortOrder(8)
                .build(),
            InterestCircle.builder()
                .name("心理健康")
                .description("情绪管理、自我关怀、心理成长")
                .icon("🧠")
                .sortOrder(9)
                .build(),
            InterestCircle.builder()
                .name("成长日记")
                .description("记录个人成长、反思与进步的点滴")
                .icon("✍️")
                .sortOrder(10)
                .build(),
            InterestCircle.builder()
                .name("宠物陪伴")
                .description("分享养宠物的快乐与经验")
                .icon("🐾")
                .sortOrder(11)
                .build(),
            InterestCircle.builder()
                .name("职场成长")
                .description("交流职场经验、职业发展与工作心得")
                .icon("💼")
                .sortOrder(12)
                .build(),
            InterestCircle.builder()
                .name("环保生活")
                .description("分享可持续生活方式与环保理念")
                .icon("🌱")
                .sortOrder(13)
                .build(),
            InterestCircle.builder()
                .name("公益志愿")
                .description("分享志愿活动、社会贡献与善意传递")
                .icon("🤝")
                .sortOrder(14)
                .build(),
            InterestCircle.builder()
                .name("手工制作")
                .description("分享手工、DIY 与手作的乐趣")
                .icon("🧶")
                .sortOrder(15)
                .build(),
            InterestCircle.builder()
                .name("园艺花卉")
                .description("养花种草、阳台园艺与自然之美")
                .icon("🌸")
                .sortOrder(16)
                .build(),
            InterestCircle.builder()
                .name("茶语咖啡")
                .description("品茶论道、咖啡文化与慢生活")
                .icon("☕")
                .sortOrder(17)
                .build(),
            InterestCircle.builder()
                .name("极简生活")
                .description("断舍离、极简主义与整理收纳")
                .icon("🏠")
                .sortOrder(18)
                .build(),
            InterestCircle.builder()
                .name("语言学习")
                .description("学习外语、文化交流与表达成长")
                .icon("🌍")
                .sortOrder(19)
                .build(),
            InterestCircle.builder()
                .name("冥想修行")
                .description("冥想正念、身心修养与灵性成长")
                .icon("🧘")
                .sortOrder(20)
                .build(),
            InterestCircle.builder()
                .name("投资理财")
                .description("理财规划、投资心得与财务自由")
                .icon("💰")
                .sortOrder(21)
                .build(),
            InterestCircle.builder()
                .name("游戏电竞")
                .description("游戏交流、电竞讨论与娱乐放松")
                .icon("🎮")
                .sortOrder(22)
                .build(),
            InterestCircle.builder()
                .name("创意分享")
                .description("分享你的创作：写作、绘画、手账、设计等，一起碰撞灵感")
                .icon("🎨")
                .sortOrder(23)
                .build()
        );

        interestCircleRepository.saveAll(circles);
        log.info("Seeded {} interest circles", circles.size());
    }

    private void seedCirclePosts() {
        if (circlePostRepository.count() > 0) {
            log.info("Circle posts already exist ({} records), skipping seed", circlePostRepository.count());
            return;
        }

        Map<String, InterestCircle> circleMap = interestCircleRepository.findAllByOrderBySortOrderAsc()
                .stream().collect(Collectors.toMap(InterestCircle::getName, c -> c));

        User author = userRepository.findAll().stream().findFirst().orElseGet(() -> {
            User systemUser = User.builder()
                    .authId(UUID.fromString("a0000000-0000-0000-0000-000000000000"))
                    .nickname("社区伙伴")
                    .bio("分享生活的美好")
                    .createdAt(Instant.now())
                    .build();
            return userRepository.save(systemUser);
        });

        // Seed multiple users for variety
        User author2 = userRepository.findAll().stream().skip(1).findFirst().orElse(author);

        List<CirclePost> posts = List.of(
            // 阅读分享📚
            createCirclePost(circleMap.get("阅读分享"), author,
                "最近在读《被讨厌的勇气》，每章都有新的触动",
                """
                之前一直听说这本书，终于开始读了。读到课题分离这一章，真的被震撼到了。

                "别人怎么看你，是别人的课题；你怎么做自己，是你的课题。"这句话让我反复琢磨了好久。

                以前总是为别人的评价焦虑，现在才明白那些都是"别人的课题"。我要把能量用在自己的课题上。

                大家最近在读什么书？有没有类似的顿悟时刻？"""),
            createCirclePost(circleMap.get("阅读分享"), author2,
                "推荐一本改变我人生的书《自卑与超越》",
                """
                阿德勒的原著《自卑与超越》，虽然写于近百年前，但思想依然振聋发聩。

                印象最深的一句话：**"每个人都带着自卑感来到这个世界，但重要的不是消除自卑，而是用它作为成长的动力。"**

                这本书让我重新理解了"自卑"——它不是缺陷，而是人类进步的源泉。

                如果你觉得自己不够好、不够优秀，强烈推荐读一读。"""),
            createCirclePost(circleMap.get("阅读分享"), author,
                "每月读书打卡：三月读完了三本书",
                """
                三月读书小结：

                1. **《被讨厌的勇气》** ⭐⭐⭐⭐⭐ — 阿德勒入门必读
                2. **《幸福的勇气》** ⭐⭐⭐⭐ — 实践篇，更生活化
                3. **《人生十二法则》** ⭐⭐⭐⭐ — 虽然不同流派，但有很多共鸣

                最深刻的感受是：**幸福不是一种状态，而是一种能力。**

                四月准备读阿德勒的《自卑与超越》原著，有人一起吗？"""),

            // 运动健身💪
            createCirclePost(circleMap.get("运动健身"), author,
                "晨跑30天的变化，不只是体重",
                """
                坚持晨跑一个月了，分享一下真实感受：

                **身体变化：**
                - 体重减了3公斤
                - 睡眠质量明显提升
                - 精力充沛，不再午困

                **心理变化（更重要）：**
                - 每天早上战胜"不想跑"的念头，本身就是一种勇气的练习
                - 不再跟别人比配速和距离，只和昨天的自己比
                - 跑步变成了一种冥想，清空杂念

                阿德勒说勇敢不是无所畏惧，而是心怀恐惧却依然前行。每天早上穿上跑鞋的那一刻，我都在练习这种勇气。"""),
            createCirclePost(circleMap.get("运动健身"), author2,
                "居家健身好物推荐",
                """
                很多人觉得健身一定要去健身房，其实在家也能练得很好。

                我的居家装备：
                - 一对可调节哑铃（最实用的投资）
                - 瑜伽垫
                - 弹力带（便宜又好用）

                跟练推荐：
                - 帕梅拉（适合想出汗的）
                - 八段锦（适合养生党）
                - keep上的自重训练（适合新手）

                关键是**每天坚持一小步**。哪怕今天只做了5分钟拉伸，也比躺着强。"""),

            // 音乐艺术🎵
            createCirclePost(circleMap.get("音乐艺术"), author,
                "工作的时候，你听什么音乐？",
                """
                最近发现不同工作适合不同类型的音乐：

                - **深度思考/编程**：钢琴独奏、环境音乐（无歌词不容易分心）
                - **重复性工作**：Jazz、Lo-fi hiphop
                - **创意头脑风暴**：电影原声、古典乐
                - **心情低落时**：阿德勒推荐的…开玩笑，来点欢快的pop

                目前在循环坂本龙一的钢琴曲，那种安静而坚定的感觉，很适合阿德勒说的"活在当下"。

                大家有喜欢的歌单推荐吗？"""),
            createCirclePost(circleMap.get("音乐艺术"), author2,
                "零基础学吉他的第一周",
                """
                35岁，决定学一门乐器。不是要成为演奏家，只是想**为生活增加一些美好的声音**。

                第一周的感受：
                - 手指真的很痛😂
                - 换和弦手忙脚乱
                - 但是！第一次完整弹出一段旋律的时候，那种开心无法形容

                阿德勒说：**不完美的勇气比完美更重要。** 我允许自己弹得不好，允许自己慢慢来。

                有没有也在学乐器的朋友？一起打卡互相鼓励呀。"""),

            // 编程技术💻
            createCirclePost(circleMap.get("编程技术"), author,
                "如何保持编程学习的动力？",
                """
                自学编程三年了，分享一下持续学习的经验：

                1. **不需要每天学很久，但尽量每天都学一点**
                2. **做项目比看教程更有效** — 找一个小项目，边做边学
                3. **不要跟教程一模一样** — 尝试加一些自己的改动
                4. **加入社区** — 有人并肩前行，坚持容易很多

                阿德勒说的共同体感觉在编程学习中也适用。当你知道你不是一个人在奋斗，很多困难就变得可以接受了。

                大家在学什么技术？最近遇到什么困难？"""),
            createCirclePost(circleMap.get("编程技术"), author2,
                "分享一个提高debug效率的小技巧",
                """
                做了这么多年开发，发现一个debug的技巧特别管用：

                **橡皮鸭调试法（Rubber Duck Debugging）**

                做法很简单：把问题讲给一个"听众"（可以是橡皮鸭、同事、甚至自己的录音），边说边理清思路。

                为什么有效？因为当你要向别人解释问题时，你必须把模糊的想法变成清晰的表达。往往说到一半，自己就发现问题了。

                这不就是阿德勒说的**课题分离**吗？把"问题"外化出来，你就能更客观地看待它。"""),

            // 亲子育儿👶
            createCirclePost(circleMap.get("亲子育儿"), author,
                "用课题分离改善亲子关系的尝试",
                """
                儿子三年级，最近为作业的事情经常闹矛盾。以前我会坐在他旁边盯着写，结果两个人都很痛苦。

                上个月试着实践课题分离：
                - 写作业是**他的课题**
                - 我的课题是**提供支持和环境**
                - 即使他写得不好、被老师批评，那也是他要面对的结果

                开始他确实偷懒了几天，但后来发现没人替他操心，反而慢慢主动了。

                这个过程最难的是**忍住不插手**。但阿德勒说得对：尊重孩子的独立性，是对他最大的信任。"""),
            createCirclePost(circleMap.get("亲子育儿"), author2,
                "孩子的自卑感，我们该如何应对？",
                """
                女儿最近说："妈妈，我们班的xx画画好厉害，我画得好丑。"

                这是典型的自卑感表达。阿德勒说自卑感是成长的动力，关键在于怎么引导。

                我没有说"你画得也很好啊"（那是撒谎），而是说：
                "xx付出了很多努力练习。如果你也想画出那样的画，我们可以一起练习。如果你更喜欢做其他事情，那也很好。"

                重点是：
                - 把孩子从"跟他人的比较"中拉出来
                - 引导到"跟自己的比较"上
                - 让她看到**努力的过程比结果更重要**

                这是鼓励（关注过程）而不是表扬（评判结果）。"""),

            // 美食烹饪🍳
            createCirclePost(circleMap.get("美食烹饪"), author,
                "周末做了红烧肉，失败三次终于成功了",
                """
                分享一个笨人做红烧肉的经历：

                第一次：放了太多酱油，咸得没法吃
                第二次：火太大，外面黑了里面还硬
                第三次：终于成功了！肥而不腻，入口即化

                做饭这件事让我体会到：
                - **失败是学习的必经之路**，没有前两次失败就没有第三次成功
                - 阿德勒说：健全的自卑感不是跟别人比，而是跟理想中的自己比
                - 我不跟大厨比，我只跟昨天的自己比

                今天的我至少能做出能吃的红烧肉了🎉

                大家有没有反复尝试终于成功的菜？分享一下吧。"""),
            createCirclePost(circleMap.get("美食烹饪"), author2,
                "夏天的解暑饮品：手搓冰粉",
                """
                夏天来了，分享一个超简单的自制冰粉：

                材料：冰粉籽、红糖、石灰水（食用级）

                步骤：
                1. 手搓冰粉籽约5分钟
                2. 加入石灰水搅匀
                3. 冷藏2小时
                4. 淋上红糖水和自己喜欢的配料

                自己做的东西就是特别有满足感！这大概就是阿德勒说的**他者贡献**——虽然只是给家人做了一碗冰粉，但看到他们吃得开心的样子，幸福感满满。

                你们夏天爱做什么饮品？"""),

            // 旅行摄影📷
            createCirclePost(circleMap.get("旅行摄影"), author,
                "一个人去大理，拍了这些照片",
                """
                上个月一个人去了大理，没有做详细攻略，就是随心走走看看。

                一个人旅行的好处：
                - 完全按照自己的节奏
                - 可以安静地感受一个地方
                - 更愿意跟陌生人交流

                拍了苍山的云、洱海的落日、古城里的一只猫。这些普通的画面，因为注入了自己的感受而变得特别。

                阿德勒说**活在当下**。在旅行的那些日子里，我没有想工作、没有想未来，只是纯粹地感受当下——那种感觉太美好了。

                下个目的地想去川西，有朋友去过吗？"""),
            createCirclePost(circleMap.get("旅行摄影"), author2,
                "手机摄影的3个小技巧，拍出朋友圈大片",
                """
                不是每个人都有单反，但每个人都可以拍出好照片。分享三个手机摄影技巧：

                1. **三分构图法** — 打开网格线，把主体放在交叉点上
                2. **利用自然光** — 黄昏的"金色时刻"是最佳拍摄时间
                3. **寻找前景** — 在画面中加入树叶、窗框等前景，增加层次感

                最重要的不是器材，而是**观察的眼光**。

                阿德勒说：我们不是看到事物的本来面目，而是看到我们内心的投射。眼里有美的人，随手拍都是美景。"""),

            // 电影动漫🎬
            createCirclePost(circleMap.get("电影动漫"), author,
                "推荐一部关于成长的电影《心灵奇旅》",
                """
                皮克斯的《心灵奇旅》（Soul），看完后久久不能平静。

                主角乔伊一生梦想成为爵士钢琴家，却在实现梦想的那天发现自己并不快乐。因为**他一直在追逐"某个时刻"，而忽略了生活的每一个当下。**

                这部电影让我想到阿德勒的思想：
                - 幸福不在遥远的未来，而在每一个日常的瞬间
                - 人生的意义不由某个"大成就"定义
                - 一片落叶、一块披萨、一阵微风——这些都是生活的意义

                "火花不是目标，而是你准备好去活着的那一刻。"

                强烈推荐每个在追求"某个目标"的人看看。"""),
            createCirclePost(circleMap.get("电影动漫"), author2,
                "重温《千与千寻》，成年后才看懂的事",
                """
                小时候看《千与千寻》只觉得是一个奇幻冒险故事。三十岁重看，泪流满面。

                **无脸男**：用物质讨好他人，想要被认可，最终发现真正的关系不是靠给予物质建立的。这不就是阿德勒说的"共同体感觉"吗？真正的归属感不来自交换，而来自真诚的连接。

                **千寻的成长**：从一个胆小的女孩到能够独立面对世界。她不是不害怕，而是带着恐惧前行——这就是勇气。

                宫崎骏真的太厉害了。每个年龄段看都有不同的理解。"""),
            createCirclePost(circleMap.get("电影动漫"), author,
                "有没有适合下班后放松看的轻松动漫？",
                """
                上了一天班，回家就想看点轻松治愈的，有没有推荐的？

                我自己推荐的几部：
                - 《摇曳露营》— 一群女孩露营的故事，画面美，节奏慢，超治愈
                - 《日常》— 笑到肚子疼
                - 《小森林》— 电影，讲一个女孩回到乡村生活的故事

                现在越来越喜欢这种"治愈系"作品。阿德勒说幸福来自对生活的贡献，但偶尔也需要给自己充电，允许自己"什么都不做"。

                欢迎推荐其他放松好片！"""),

            // 心理健康🧠
            createCirclePost(circleMap.get("心理健康"), author,
                "学会和焦虑共处，而不是消灭它",
                """
                很长一段时间里，我都在努力"战胜焦虑"。结果越是抗拒，焦虑越强烈。

                直到学了阿德勒心理学才明白：**焦虑是人类的正常情绪，它本身不是问题。**

                就像阿德勒说的自卑感一样——关键不是消除它，而是理解它、接纳它，把它转化为行动的动力。

                现在我对待焦虑的方式变了：
                - 先承认：我现在很焦虑
                - 再理解：这个焦虑想告诉我什么？
                - 最后行动：我能做一件什么小事来改善？

                大家有什么和情绪共处的经验？"""),
            createCirclePost(circleMap.get("心理健康"), author2,
                "正念冥想入门：每天5分钟就够了",
                """
                以前觉得冥想太玄乎，试了之后才发现，其实就是**给大脑做拉伸运动**。

                入门很简单：
                1. 找一个安静的地方坐下
                2. 闭上眼睛，把注意力放在呼吸上
                3. 思绪飘走了没关系，温柔地拉回来就行

                每天只需要5分钟。坚持两周后，我最大的收获是：
                - 不再被情绪牵着走
                - 能更快地觉察到自己在"内耗"
                - 睡觉前不再胡思乱想

                这跟阿德勒说的**活在当下**其实是一个道理：不是活在过去的原因里，也不是活在未来的焦虑里，而是此时此刻。"""),

            // 成长日记✍️
            createCirclePost(circleMap.get("成长日记"), author,
                "写了半年日记，我发现了一个秘密",
                """
                从年初开始每天写日记，不是长篇大论，就三句话：
                1. 今天做了什么
                2. 今天什么感受
                3. 今天学到了什么

                半年后的发现：
                - **每天的"小进步"加在一起，就是巨大的成长**
                - 原来我每天都在变好，只是没有记录下来
                - 回头翻看时，能看到自己清晰的成长轨迹

                阿德勒说：人们往往高估一天能做的事，却低估一年能做的事。

                明天就开始吧，哪怕只写一句话。"""),
            createCirclePost(circleMap.get("成长日记"), author2,
                "我的每日三省：一种简单的自我反思法",
                """
                分享一个简单有效的每日反思框架，来自阿德勒的三个核心概念：

                **三问：**
                1. 今天我有没有进行课题分离？（有没有把别人的事当做自己的事来烦恼？）
                2. 今天我为他人做了贡献吗？（哪怕只是帮同事倒杯水）
                3. 今天我接纳了自己吗？（允许自己不完美，允许自己慢慢来）

                每天睡前花两分钟回答这三个问题，已经坚持了三个月。现在遇到困难和挫折时，心态稳定多了。

                你也可以试试，或者设计自己的"三省"问题。"""),

            // 宠物陪伴🐾
            createCirclePost(circleMap.get("宠物陪伴"), author,
                "领养了一只流浪猫，它治愈了我",
                """
                去年领养了一只流浪猫，本来以为是"我救了它"，后来发现是**它救了我**。

                每天下班回家，它会在门口等着。不是像狗一样扑上来，就是静静地坐在那里，看你一眼——好像在说"你回来了"。

                养猫让我学会了很多：
                - **无条件的陪伴**——它不关心我赚多少钱、什么职位
                - **活在当下**——猫是最好的"正念大师"，它们只关注此刻
                - **课题分离**——我给它提供食物和家，但它要不要亲近我，是它的自由

                阿德勒说共同体感觉是幸福的关键。我的猫就是我的小小共同体。"""),
            createCirclePost(circleMap.get("宠物陪伴"), author2,
                "养狗的日常：每天遛狗是最好的治愈",
                """
                养了一只金毛，最大的收获不是陪伴，而是**它逼着我每天出门散步**。

                以前下班就躺沙发上刷手机，现在每天至少走5公里。不仅身体变好了，心情也好多了。

                遛狗的时候：
                - 看到了以前没注意的路边花
                - 认识了好多邻居（都是因为狗找到的共同话题）
                - 大脑放空，很多灵感在散步时冒出来

                这就是阿德勒说的**他者贡献**吧——照顾另一个生命的过程，本身就是幸福感的来源。

                晒晒你们的毛孩子？"""),

            // 职场成长💼
            createCirclePost(circleMap.get("职场成长"), author,
                "30岁转行，我用勇气战胜了恐惧",
                """
                做了8年的会计，30岁决定转行做产品经理。身边的亲友都觉得我疯了。

                转行的过程真的很难：
                - 从头学起，刚开始什么都不懂
                - 面试被拒了十几次
                - 怀疑自己是不是做了错误的选择

                但我记得阿德勒说的：**勇气不是无所畏惧，而是心怀恐惧却依然选择前行。**

                现在已经在新岗位一年了，回头看，最不后悔的决定就是这个。不是因为结果有多好，而是因为我没有被恐惧困在原地。

                有没有也在考虑转行或换赛道的朋友？一起交流。"""),
            createCirclePost(circleMap.get("职场成长"), author2,
                "工作中总是讨好同事，怎么建立边界？",
                """
                以前我是典型的"老好人"——同事的请求从不拒绝，加班到很晚帮别人擦屁股，结果自己的事情反而做不完。

                学了课题分离后开始改变了：
                - 同事的工作责任是**他的课题**
                - 我的边界和精力是**我的课题**
                - 拒绝别人不是冷漠，是尊重自己的边界

                现在学会了说"不"：
                - "这个我现在帮不了，手头有紧急的事"
                - "这个你可以找xx试试，他更熟悉"

                刚开始很不习惯，怕得罪人。但后来发现，**有边界的人反而更被尊重**。

                大家在职场上是怎么处理边界问题的？"""),

            // 环保生活🌱
            createCirclePost(circleMap.get("环保生活"), author,
                "我的零浪费生活实验：一个月只产生一罐垃圾",
                """
                上个月做了一个挑战：尽可能减少垃圾产生。

                我的做法：
                - 自带布袋购物，不用塑料袋
                - 用玻璃饭盒代替外卖打包盒
                - 自制清洁剂（小苏打+白醋真的很好用）
                - 二手平台买卖闲置物品

                结果：一个月的不可回收垃圾只有一个玻璃罐那么多！

                这和阿德勒的共同体感觉有深刻的联系——当我们意识到自己是地球这个更大共同体的成员时，环保就不是"牺牲"，而是**贡献**。

                一个小小的改变，带来的是对生活更多的觉察。"""),
            createCirclePost(circleMap.get("环保生活"), author2,
                "旧物改造的乐趣：给闲置物品第二次生命",
                """
                最近迷上了旧物改造，分享几个简单的：

                - 旧T恤 → 剪成抹布或编织成地垫
                - 玻璃瓶 → 洗干净当花瓶或储物罐
                - 快递纸箱 → 和小朋友一起做手工城堡
                - 旧牛仔裤 → 做成收纳袋

                最大的感受：**我们需要的其实比以为的少得多。**

                每次改造成功一个旧东西，都是一种小小的成就感。这不就是阿德勒说的——幸福来自于贡献感吗？哪怕只是给一件旧衣服找到了新的用处。

                你们有什么旧物改造的妙招？"""),

            // 公益志愿🤝
            createCirclePost(circleMap.get("公益志愿"), author,
                "第一次做志愿者，原来给予比收获更幸福",
                """
                上周末第一次参加社区志愿者活动，去养老院陪老人们聊天。

                去之前很紧张，怕自己不知道该说什么。但到了才发现，老人们只需要有人听他们说话就好。

                一位奶奶跟我讲她年轻时的故事，眼睛亮亮的，好像回到了青春时代。那一刻我突然理解了阿德勒说的**他者贡献**——当你为他人带来一点光亮的时候，你自己的世界也被照亮了。

                回家路上心情特别好，那种快乐和买了一件好东西完全不同。更踏实、更持久。

                我们社区每月都有志愿活动，下次还去。"""),
            createCirclePost(circleMap.get("公益志愿"), author2,
                "不是在帮助别人，而是和他人一起成长",
                """
                做公益这些年，最大的领悟是：**不要把公益当做"帮助别人"**。

                这种"帮助者vs被帮助者"的视角，本质上是一种纵向关系——好像我高你低，我有能力你没有。

                阿德勒主张横向关系——人人平等。做公益最宝贵的部分，不是"我帮助了谁"，而是**我们共同创造了什么**。

                比如：
                - 不是"我教孩子读书"，而是"我们分享阅读的快乐"
                - 不是"我帮助老人"，而是"我从老人那里学到了人生智慧"
                - 不是单向给予，而是相互成长

                谁也在做志愿活动？分享一下你的故事和感悟吧。"""),

            // 手工制作🧶
            createCirclePost(circleMap.get("手工制作"), author,
                "第一次学钩针，一针一线都是专注的练习",
                """
                最近学了钩针编毛线，虽然刚开始歪歪扭扭的，但过程特别解压。

                做手工的时候发现：
                - 手在动的时候，大脑反而能安静下来
                - **不追求完美**，只享受一针一线的过程
                - 完成一件小东西后的成就感很治愈

                阿德勒说的"活在当下"在手工里特别容易体验到——你的全部注意力都在手上的一根线、一个结上，没有过去也没有未来，就是此刻。

                有没有也在做手工的朋友？晒晒你的作品。"""),
            createCirclePost(circleMap.get("手工制作"), author2,
                "和孩子一起做手工，是最好的亲子时间",
                """
                周末和5岁的女儿一起用纸箱做了一个小房子，花了整整一个下午，但是特别开心。

                我发现和孩子一起做手工有几个好处：
                - **培养专注力**——两个人都沉浸其中
                - **横向关系**——不是"我教你"，而是一起探索
                - **鼓励胜过表扬**——关注她努力的过程，不只是结果

                房子歪了点、涂色出了边界，但那是她亲手的作品。阿德勒说教育不是追求完美，而是培养勇气。手工作品的不完美，恰恰是最好的教育素材。"""),

            // 园艺花卉🌸
            createCirclePost(circleMap.get("园艺花卉"), author,
                "阳台种菜日记：从一粒种子到一盘菜",
                """
                在阳台种了小番茄和生菜，从播种到今天第一次吃到自己种的菜，用了两个月。

                种植的过程让我学到了太多：
                - **耐心**——植物的生长急不来，只能每天浇水、等待
                - **接纳无常**——不是每颗种子都会发芽，不是每株苗都能长大
                - **贡献感**——看着种子发芽、长大、结果，那种满足感很难形容

                阿德勒说共同体感觉不限于人际关系。当你照料一株植物，看着它因为你而茁壮生长，那种"我对这个世界有贡献"的感觉，就是幸福。

                阳台种菜，不只是种菜，是种耐心、种希望。"""),
            createCirclePost(circleMap.get("园艺花卉"), author2,
                "治愈系多肉养成记",
                """
                入坑多肉三年了，从开始养死一半到现在大部分都能活，中间经历了不少。

                分享几个新手建议：
                - **控水最重要**——多肉不怕干，怕涝
                - **阳光适度**——不是越多越好，夏天要遮阴
                - **土要透气**——普通泥土不行，要用颗粒土

                养多肉最治愈的是什么？每天看看它们，颜色变了、长新芽了、终于服盆了——**小小的变化带来大大的快乐**。

                有人说多肉长得慢，但我觉得慢一点好。在这个什么都要快的时代，慢下来感受一株植物的生长，本身就是一种练习——练习专注、练习等待、练习接纳。"""),

            // 茶语咖啡☕
            createCirclePost(circleMap.get("茶语咖啡"), author,
                "学会泡一杯好茶，也是学会对自己好一点",
                """
                以前喝茶就是往杯子里丢个茶包倒热水，后来跟着朋友学了功夫茶，才发现泡茶本身就是一个**让自己慢下来的仪式**。

                泡茶的几个瞬间特别享受：
                - 烧水的声音，咕噜咕噜的，很安心
                - 第一泡倒掉的时候，茶香弥漫整个桌子
                - 小口品茶，不需要急着喝完

                阿德勒说人生不是由别人赋予的，而是由自己选择的。泡一杯好茶、花十分钟专心品尝，看起来是浪费时间，其实是**为自己选择了一种更从容的生活方式**。

                你们喜欢喝什么茶？"""),
            createCirclePost(circleMap.get("茶语咖啡"), author2,
                "手冲咖啡入坑指南",
                """
                从速溶到挂耳、再到手冲，咖啡入坑的过程就是审美升级的过程。

                手冲入门装备不用很贵：
                - 一个V60滤杯 + 滤纸
                - 一把手冲壶（能控制水流就行）
                - 一个磨豆机（新鲜研磨比什么都重要）

                手冲最迷人的不是味道，是**过程**：
                - 研磨时咖啡豆的香气
                - 闷蒸时鼓起来的"蘑菇云"
                - 看着水流一圈一圈地注入

                每天早上的手冲仪式，是我给自己留的10分钟"横向关系"时刻——不跟任何人比较，只是安静地做一件让自己开心的事。"""),

            // 极简生活🏠
            createCirclePost(circleMap.get("极简生活"), author,
                "断舍离三年，我的生活发生了哪些变化",
                """
                三年前开始践行断舍离，从衣柜开始清理，扔掉了几大袋不再穿的衣服。

                三年后回头看，最大的变化不是东西变少了，而是**心态变了**：

                - **不再用购物填补空虚**——买东西之前会问"我真的需要吗"
                - **更珍惜已有的东西**——每一件留下的物品都有它存在的理由
                - **空间变得清爽**——回到家不再有压迫感
                - **时间变多了**——不需要花时间整理没用的东西

                阿德勒说幸福感来自对他人有贡献，而不是拥有多少东西。断舍离的过程，就是**把注意力从"拥有"转移到"体验"和"贡献"上**。

                有没有也在断舍离的朋友？你最舍弃不掉的是什么？"""),
            createCirclePost(circleMap.get("极简生活"), author2,
                "手机桌面极简法：3个步骤让手机不再打扰你",
                """
                数字极简是生活极简的重要部分。分享我的手机整理方法：

                **第一步：删**
                - 删掉超过一个月没打开的app
                - 把购物app的快捷入口去掉
                - 关掉所有不必要的通知

                **第二步：藏**
                - 主屏幕只留最常用的6-8个app
                - 其余收进文件夹，放在第二屏
                - 社交app从主屏移除，减少无意识打开

                **第三步：约**
                - 设定每天刷社交媒体的时间段
                - 睡前一小时不看手机
                - 把手机放在卧室外面充电

                阿德勒说**目的论**：我们刷手机不是因为我们控制不住自己，而是因为我们选择了用刷手机来逃避某些东西。搞清楚"我在逃避什么"，才能真正放下手机。"""),

            // 语言学习🌍
            createCirclePost(circleMap.get("语言学习"), author,
                "零基础学英语一年，我废掉又重来三次",
                """
                自学英语一年的心路历程：
                - 1月：踌躇满志，每天打卡
                - 3月：第一次放弃，停了半个月
                - 5月：又捡起来，换了个方法
                - 8月：第二次放弃
                - 10月：第三次重新开始
                - 现在：还在坚持，但不再对自己那么苛刻了

                最大的领悟：**学习语言不需要"完美坚持"，需要的是"不完美但持续"**。

                阿德勒说自卑感不是问题，问题是你如何面对它。每次放弃后的重新开始，都是一次勇气的练习。我不再因为中断而自责，只是继续走。

                有什么好用的学英语方法推荐吗？"""),
            createCirclePost(circleMap.get("语言学习"), author2,
                "不是为了考试而学语言，是为了打开一扇窗",
                """
                很多人学外语是为了考试，但我觉得**语言真正的魅力是打开一个新的世界**。

                比如：
                - 用日语看原版动漫，才发现翻译丢失了多少东西
                - 用英语看阿德勒的原文，比中文译本多了很多细节
                - 和一个法国人用他蹩脚的英语和我蹩脚的法语聊天，虽然磕磕绊绊但特别开心

                阿德勒说共同体感觉是幸福的关键。学一门新语言，就是**扩大你的共同体**——你能连接到更多不同文化的人，理解更多不同的思考方式。

                你学外语是为了什么？"""),

            // 冥想修行🧘
            createCirclePost(circleMap.get("冥想修行"), author,
                "冥想100天，我的焦虑症好了一大半",
                """
                医生建议治疗焦虑症试试冥想，当时觉得很玄但又没别的办法。

                刚开始坐不住，5分钟就浑身难受。后来慢慢习惯，现在每天20分钟。

                100天后的变化：
                - 焦虑发作的频率明显减少
                - 不再那么容易"被点燃"
                - 能觉察到情绪升起的那个瞬间，在爆发之前喊停
                - **自我接纳度大幅提高**——不再因为焦虑而更加焦虑

                阿德勒说活在当下，冥想就是活在当下的练习。不是逃避现实，是**更清醒地面对现实**。

                有朋友问冥想是不是什么都不想？不是。是觉察到自己在想什么，然后温柔地回来。"""),
            createCirclePost(circleMap.get("冥想修行"), author2,
                "不是只有盘腿打坐才是冥想",
                """
                很多人对冥想有误解，以为一定要盘腿打坐一小时。

                其实冥想可以很简单：

                - **走路冥想**：专注于每一步的感觉，脚底和地面的接触
                - **喝茶冥想**：只关注茶的温度、香气、口感
                - **洗碗冥想**：感受水的温度、泡沫的触感
                - **等红绿灯冥想**：做三次深呼吸

                本质都是一样的：**把注意力带回到当下**。

                阿德勒说过去的一切都不能决定你，你能决定的只有此刻。冥想就是练习"活在此时此地"的能力。不需要一小时，一分钟就够了。"""),

            // 投资理财💰
            createCirclePost(circleMap.get("投资理财"), author,
                "从月光到存款六位数，我做的第一件事是记账",
                """
                以前每个月都不知道钱花哪了，工资到账就还花呗，月底剩不下什么。

                改变的起点很简单：**开始记账**。

                不是复杂的那种，就是用手机备忘录记每天的大额开销。三个月后发现：
                - 外卖和奶茶一个月居然花了快两千
                - 冲动购物的东西大部分只用了一两次
                - 订阅的会员好几个根本没用

                砍掉这些不必要的开销后，每个月能存下不少。

                记账这件事跟阿德勒的自我觉察很像：**只有看清了现实，才能做出改变**。你不知道钱去哪了，怎么规划未来？

                大家有什么理财心得？"""),
            createCirclePost(circleMap.get("投资理财"), author2,
                "不买基金不代表你不够努力，而是要找到适合自己的方式",
                """
                身边的朋友都在讨论基金股票，好像不理财就亏了一样。但我试了一段时间发现，频繁看盘反而让我焦虑，打乱了我的生活节奏。

                后来想通了：理财最重要的不是收益率，是**安心**。

                我的方式很简单：
                - 工资到账先存30%到不常用的账户
                - 剩下的随便花（不焦虑了反而花得更少）
                - 不追热点、不频繁操作
                - 每年复盘一次调整策略

                阿德勒说：不要用别人的标准衡量自己的人生。理财也是——不要因为别人赚了30%就焦虑，找到让自己安心的节奏就好。

                你是哪种投资风格？"""),

            // 游戏电竞🎮
            createCirclePost(circleMap.get("游戏电竞"), author,
                "成年人玩游戏，真的浪费时间吗？",
                """
                经常有人说"都工作了还玩游戏，浪费生命"。

                但我有不同看法：

                - **缓解压力**：打完一局游戏心情好很多，比憋着强
                - **团队协作**：联机游戏很考验沟通和配合
                - **成就感**：攻克一个难关、升一个段位，是实实在在的正反馈
                - **社交连接**：和远方的朋友约一局，比尬聊半天有效多了

                阿德勒不是说人要真实吗？喜欢游戏就承认喜欢，不需要找高大上的理由。**适度玩游戏让自己快乐，这就是对自己负责**。

                当然前提是适度——如果影响了工作和生活就该调整了。你们在玩什么游戏？"""),
            createCirclePost(circleMap.get("游戏电竞"), author2,
                "从游戏中学到的三件事",
                """
                玩了几十年游戏，回头想想，游戏其实教会了我很多：

                1. **失败是常态**——任何一个好游戏，你都会死无数次。重要的是每次都学点什么，然后重新开始。这就是阿德勒说的"勇气"。

                2. **合作大于竞争**——最难的游戏往往不是打怪，是跟队友配合。团队氛围好的局就算输了也开心。

                3. **享受过程**——如果只盯着通关，游戏就变成了工作。最美的体验往往在探索的路上，而不是终点。

                游戏虽然不是"正事"，但里面有很多人生道理。你从游戏中学到了什么？""")
        );

        circlePostRepository.saveAll(posts);
        log.info("Seeded {} circle posts across all circles", posts.size());
    }

    private CirclePost createCirclePost(InterestCircle circle, User author, String title, String content) {
        return CirclePost.builder()
                .circle(circle)
                .author(author)
                .title(title)
                .content(content)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }
}
