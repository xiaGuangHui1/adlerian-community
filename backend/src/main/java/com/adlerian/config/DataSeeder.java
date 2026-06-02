package com.adlerian.config;

import com.adlerian.entity.Post;
import com.adlerian.entity.Resource;
import com.adlerian.entity.User;
import com.adlerian.repository.PostRepository;
import com.adlerian.repository.ResourceRepository;
import com.adlerian.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * 应用启动时自动检查并填充 mock 数据。仅当对应表为空时才写入，
 * 避免覆盖已有数据。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final PostRepository postRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) {
        seedResources();
        seedPosts();
    }

    private void seedResources() {
        if (resourceRepository.count() > 0) {
            log.info("Resources already exist ({} records), skipping seed", resourceRepository.count());
            return;
        }

        List<Resource> resources = List.of(
            Resource.builder()
                .title("自卑感与超越")
                .description("阿德勒心理学的基石概念，探讨自卑感的本质与转化")
                .type("concept")
                .content("每个人都有自卑感，这是人类进步的动力。自卑感本身不是问题，问题在于我们如何面对它。健康的自卑感驱动我们成长，自卑情结则是逃避的借口。")
                .sortOrder(1)
                .createdAt(Instant.now())
                .build(),
            Resource.builder()
                .title("课题分离")
                .description("区分自己的课题和他人的课题，获得自由")
                .type("concept")
                .content("核心问题：这件事最终的后果由谁来承担？不干涉他人的课题，也不让他人干涉自己的课题。课题分离不是冷漠，而是尊重彼此的独立性。")
                .sortOrder(2)
                .createdAt(Instant.now())
                .build(),
            Resource.builder()
                .title("共同体感觉")
                .description("幸福来自归属感和贡献感")
                .type("concept")
                .content("阿德勒认为幸福的关键在于共同体感觉——感觉自己属于一个共同体并愿意为之贡献。三个要素：自我接纳、他者信赖、他者贡献。")
                .sortOrder(3)
                .createdAt(Instant.now())
                .build(),
            Resource.builder()
                .title("《被讨厌的勇气》")
                .description("岸见一郎 / 古贺史健 | 阿德勒心理学入门必读")
                .type("book")
                .content("以对话体的形式探讨自由、幸福、人际关系等根本问题。被誉为改变人生的哲学课。")
                .sortOrder(4)
                .createdAt(Instant.now())
                .build(),
            Resource.builder()
                .title("《自卑与超越》")
                .description("阿尔弗雷德·阿德勒 | 个体心理学经典")
                .type("book")
                .content("阿德勒亲自撰写的代表作，系统阐述个体心理学核心理论，涵盖自卑感、社会兴趣、生活风格等概念。")
                .sortOrder(5)
                .createdAt(Instant.now())
                .build(),
            Resource.builder()
                .title("《幸福的勇气》")
                .description("岸见一郎 / 古贺史健 | 从理论到实践")
                .type("book")
                .content("被讨厌的勇气续作，聚焦如何在现实中实践阿德勒心理学，特别是在教育和人际关系中的应用。")
                .sortOrder(6)
                .createdAt(Instant.now())
                .build(),
            Resource.builder()
                .title("横向关系与纵向关系")
                .description("所有关系都应该是平等的")
                .type("concept")
                .content("阿德勒主张人际关系应该是横向的（平等的），而非纵向的（上下之分）。用鼓励替代表扬，用感谢替代评判。")
                .sortOrder(7)
                .createdAt(Instant.now())
                .build(),
            Resource.builder()
                .title("目的论：行为由目的驱动")
                .description("重新审视你的选择，而非归咎于过去")
                .type("concept")
                .content("阿德勒反对原因论。我们不是被过去决定的，而是为了某种目的选择了现在的行为。既然是自己选择的，就可以做出新的选择。")
                .sortOrder(8)
                .createdAt(Instant.now())
                .build(),
            Resource.builder()
                .title("生活风格：你的行为模式")
                .description("理解并改变你的思维和行动模式")
                .type("concept")
                .content("生活风格是幼年形成的对自我和世界的根本看法。它影响我们所有的思维和行为——但它是可以改变的。人有自我决定的能力。")
                .sortOrder(9)
                .createdAt(Instant.now())
                .build(),
            Resource.builder()
                .title("《儿童的人格形成及其教育》")
                .description("阿尔弗雷德·阿德勒 | 教育心理学经典")
                .type("book")
                .content("阿德勒关于儿童教育的经典著作，探讨儿童人格形成过程与正确的教育方式。")
                .sortOrder(10)
                .createdAt(Instant.now())
                .build()
        );

        resourceRepository.saveAll(resources);
        log.info("Seeded {} learning resources", resources.size());
    }

    private void seedPosts() {
        if (postRepository.count() > 0) {
            log.info("Posts already exist ({} records), skipping seed", postRepository.count());
            return;
        }

        Optional<User> authorOpt = userRepository.findAll().stream().findFirst();
        if (authorOpt.isEmpty()) {
            log.info("No users found, skipping post seed. Posts will be created after first user registers.");
            return;
        }

        User author = authorOpt.get();

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
}
